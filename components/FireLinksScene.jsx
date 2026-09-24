"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useCallback, useEffect, useMemo, useRef } from "react";

const MODEL_URL = "/models/Boxes.glb";

/**
 * In Blender the cards sit in a row along -Y and their faces point down -X.
 * glTF converts Z-up -> Y-up, so in three.js the row runs along +Z and the
 * faces point down -X. Rotating a card +90deg around Y turns the row onto the
 * screen's X axis and swings its face (text + icon) toward +Z, at the camera.
 *
 * That rotation lives *inside* each card group rather than on a shared
 * parent, so a card's own rotation.x/.y stay aligned with the world axes and
 * can be driven per card without rolling the artwork.
 */
const FACE_CAMERA_Y = Math.PI / 2;

/** Tips the faces up a little so the bottom light rakes across them. */
const FACE_UP_X = -0.18;

/** Pulled forward from z=0 so the cards read closer to the camera. */
const RIG_Z = 3;

/** Blows up each card about its own centre without spreading the row. */
const CARD_SCALE = 1.5;

/**
 * Baked lighting/labels are not in the .glb (it was exported without
 * materials), so each card body gets its atlas from /public/textures.
 * Order is left -> right along the row, matching reference/blender.png.
 * If a label lands on the wrong card, reorder this array.
 *
 * TODO: the hrefs are still the placeholders from FLoatingFireLinks.jsx.
 */
const CARDS = [
    {
        label: "LinkedIn",
        texture: "/textures/LIBaked.jpg",
        href: "https://linkedin.com/in/your-profile",
    },
    {
        label: "LeetCode",
        texture: "/textures/LCBaked.jpg",
        href: "https://leetcode.com/your-profile",
    },
    {
        label: "GitHub",
        texture: "/textures/GIBaked.jpg",
        href: "https://github.com/your-profile",
    },
    {
        label: "Resume",
        texture: "/textures/REBaked.jpg",
        href: "/resume.pdf",
    },
];

const TEXTURES = CARDS.map((card) => card.texture);

const ICON_COLOR = "#ff7a18";
const TEXT_COLOR = "#ffffff";

/**
 * A Cube* node counts as one of the four corner emitters when its longest
 * side is under this fraction of the card's longest side. The corner cubes
 * are ~0.14 against a ~4.4 card; the body and the lower bar are 3.2+.
 */
const ACCENT_MAX_EXTENT = 0.1;

// Cards are ~4.4 units deep and ~8.4 apart, so anything closer than this
// belongs to the same card (box mesh + its text + its icon curves).
const CARD_GAP = 3;

const DROP_DELAY = 3;
const DROP_DURATION = 1;
const DROP_STAGGER = 0.18;

const HOVER_LIFT = 0.9;
const HOVER_STIFFNESS = 260;
const HOVER_DAMPING = 13;

const YAW_PER_NDC = 0.3;
const PITCH_PER_NDC = 0.22;
const MAX_TILT = 0.34;

/**
 * Below this viewport aspect (width / height) the row is too cramped to read,
 * so the cards move into a 2x2 grid instead.
 */
const GRID_MAX_ASPECT = 0.8;
const GRID_COLUMNS = 2;

/** Grid: the band under the centred <h1>, as fractions of height. */
const GRID_TOP = 0.08;
const GRID_BOTTOM = 0.46;
const GRID_MAX_WIDTH = 0.9;

/**
 * There is no cursor to follow on touch screens, so in the grid each card
 * swivels on its own. Speeds are in radians per second; the per-card phase
 * keeps neighbours out of step.
 */
const SWIVEL_YAW = 0.26;
const SWIVEL_PITCH = 0.12;
const SWIVEL_YAW_SPEED = 0.9;
const SWIVEL_PITCH_SPEED = 0.65;
const SWIVEL_PHASE = 1.7;

/**
 * Splits the flat glTF node list into one entry per card and works out where
 * that card sits once the +90deg turn is applied.
 */
function useCards() {
    const { scene } = useGLTF(MODEL_URL);

    return useMemo(() => {
        const root = scene.clone(true);

        const bounds = new THREE.Box3();

        const parts = root.children.slice().map((object) => {
            const box = new THREE.Box3().setFromObject(object);

            bounds.union(box);

            return {
                object,
                box,
                z: box.getCenter(new THREE.Vector3()).z,
            };
        });

        parts.sort((a, b) => a.z - b.z);

        const groups = [];

        parts.forEach(({ object, box, z }) => {
            const current = groups[groups.length - 1];

            if (current && z - current.z <= CARD_GAP) {
                current.parts.push({ object, box });
                current.box.union(box);
                current.z = z;

                return;
            }

            groups.push({ parts: [{ object, box }], box: box.clone(), z });
        });

        const origin = bounds.getCenter(new THREE.Vector3());

        const cards = groups.map((group) => {
            const center = group.box.getCenter(new THREE.Vector3());
            const size = group.box.getSize(new THREE.Vector3());

            const offset = center.clone().sub(origin);

            const extent = Math.max(size.x, size.y, size.z);

            group.parts.forEach(({ object, box }) => {
                // glTF node names survive the clone: Curve* are the icons and
                // Text* the labels. The rest are Cube*, where the four corner
                // emitters are the only ones that are tiny next to the card -
                // the body and the lower bar are both card-sized.
                const partSize = box.getSize(new THREE.Vector3());

                object.userData.role = object.name.startsWith("Curve")
                    ? "icon"
                    : object.name.startsWith("Text")
                      ? "text"
                      : Math.max(partSize.x, partSize.y, partSize.z) <=
                          extent * ACCENT_MAX_EXTENT
                        ? "accent"
                        : "body";
            });

            return {
                objects: group.parts.map((part) => part.object),
                center,
                // Rotating (x, y, z) by +90deg about Y gives (z, y, -x).
                position: new THREE.Vector3(offset.z, offset.y, -offset.x),
                // ...and the same swap applies to the card's extents.
                size: new THREE.Vector3(
                    size.z * CARD_SCALE,
                    size.y * CARD_SCALE,
                    size.x * CARD_SCALE,
                ),
                hitSize: new THREE.Vector3(
                    size.z * CARD_SCALE,
                    size.y * CARD_SCALE + HOVER_LIFT,
                    size.x * CARD_SCALE,
                ),
            };
        });

        // How wide the row is on screen once each card is scaled up.
        const first = cards[0];
        const last = cards[cards.length - 1];

        const span =
            last.position.x -
            first.position.x +
            (first.hitSize.x + last.hitSize.x) / 2;

        return { cards, span };
    }, [scene]);
}

function FireLinks() {
    const cardRefs = useRef([]);
    const hitRefs = useRef([]);

    // Raw client coordinates; turned into canvas-relative NDC on demand so
    // they stay correct when the page scrolls the canvas under the cursor.
    const client = useRef(null);
    const mouse = useRef({ x: 0, y: 0 });
    const hovered = useRef(-1);
    const settledRef = useRef(false);
    const springs = useRef(CARDS.map(() => ({ value: 0, velocity: 0 })));

    const raycaster = useMemo(() => new THREE.Raycaster(), []);
    const pointer = useMemo(() => new THREE.Vector2(), []);
    const scratch = useMemo(() => new THREE.Vector3(), []);

    const { cards, span } = useCards();
    const { camera, gl, viewport } = useThree();

    const maps = useTexture(TEXTURES);

    // The baked atlas carries the card body; the icon curves and the text get
    // flat colours instead. A little emissive keeps both legible against the
    // bright fire background, which otherwise washes them out.
    useEffect(() => {
        const created = [];

        cards.forEach((card, index) => {
            const map = maps[index % maps.length];

            map.flipY = false;
            map.colorSpace = THREE.SRGBColorSpace;
            map.needsUpdate = true;

            const body = new THREE.MeshStandardMaterial({
                map,
                roughness: 0.38,
                metalness: 0.22,
            });

            const icon = new THREE.MeshStandardMaterial({
                color: ICON_COLOR,
                emissive: ICON_COLOR,
                emissiveIntensity: 0.45,
                roughness: 0.3,
                metalness: 0.1,
            });

            const text = new THREE.MeshStandardMaterial({
                color: TEXT_COLOR,
                emissive: TEXT_COLOR,
                emissiveIntensity: 0.3,
                roughness: 0.35,
                metalness: 0.05,
            });

            // The four corner cubes are emitters in Blender, so they take the
            // icon orange but glow harder - they have no surface detail to
            // read as anything else.
            const accent = new THREE.MeshStandardMaterial({
                color: ICON_COLOR,
                emissive: ICON_COLOR,
                emissiveIntensity: 1.1,
                roughness: 0.4,
                metalness: 0,
            });

            const byRole = { body, icon, text, accent };

            created.push(body, icon, text, accent);

            card.objects.forEach((object) => {
                const material = byRole[object.userData.role] ?? body;

                object.traverse((node) => {
                    if (node.isMesh) node.material = material;
                });
            });
        });

        return () => {
            created.forEach((material) => material.dispose());
        };
    }, [cards, maps]);

    const view = useMemo(
        () => viewport.getCurrentViewport(camera, [0, 0, RIG_Z]),
        [viewport, camera],
    );

    const grid = view.width / view.height < GRID_MAX_ASPECT;

    const layout = useMemo(() => {
        if (!grid) {
            const spanFactor = view.width < 6 ? 0.92 : 0.78;

            return {
                positions: cards.map((card) => card.position),
                scale: (view.width * spanFactor) / span,
                rigY: -view.height * 0.22,
            };
        }

        const { size } = cards[0];

        const rows = Math.ceil(cards.length / GRID_COLUMNS);

        // Leave room for the hover lift so a raised card never overlaps (or
        // steals hover from) the one above it.
        const gapY = Math.max(size.y * 0.3, HOVER_LIFT + 0.3);
        const gapX = size.x * 0.12;

        const pitchX = size.x + gapX;
        const pitchY = size.y + gapY;

        const width = GRID_COLUMNS * size.x + (GRID_COLUMNS - 1) * gapX;
        const height = rows * size.y + (rows - 1) * gapY;

        const bandHeight = view.height * (GRID_BOTTOM - GRID_TOP);

        return {
            // Left -> right, then top -> bottom, so CARDS order still reads
            // naturally.
            positions: cards.map((card, index) => {
                const column = index % GRID_COLUMNS;
                const row = Math.floor(index / GRID_COLUMNS);

                return new THREE.Vector3(
                    (column - (GRID_COLUMNS - 1) / 2) * pitchX,
                    ((rows - 1) / 2 - row) * pitchY,
                    card.position.z,
                );
            }),
            scale: Math.min(
                (view.width * GRID_MAX_WIDTH) / width,
                bandHeight / height,
            ),
            rigY: -view.height * ((GRID_TOP + GRID_BOTTOM) / 2),
        };
    }, [grid, cards, span, view]);

    const { positions, scale, rigY } = layout;

    // Far enough above the rig's resting height that even the lowest card
    // clears the top of the frame, so the cards fall in from outside it.
    const lowest = Math.min(...positions.map((position) => position.y));

    const dropHeight =
        (view.height / 2 - rigY) / scale - lowest + cards[0].hitSize.y * 2;

    const toNdc = useCallback(
        (clientX, clientY) => {
            const rect = gl.domElement.getBoundingClientRect();

            mouse.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
            mouse.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        },
        [gl],
    );

    const pick = useCallback(() => {
        pointer.set(mouse.current.x, mouse.current.y);
        raycaster.setFromCamera(pointer, camera);

        const hit = raycaster.intersectObjects(
            hitRefs.current.filter(Boolean),
            false,
        )[0];

        return hit ? hitRefs.current.indexOf(hit.object) : -1;
    }, [camera, pointer, raycaster]);

    const openCard = useCallback((event) => {
        if (!settledRef.current) return;

        // Pick at the click itself rather than trusting the last hover: taps
        // on touch screens never produce a hover to begin with.
        toNdc(event.clientX, event.clientY);

        const card = CARDS[pick()];

        if (!card) return;

        if (card.href.startsWith("http")) {
            window.open(card.href, "_blank", "noopener,noreferrer");

            return;
        }

        window.location.href = card.href;
    }, [pick, toNdc]);

    useEffect(() => {
        const canvas = gl.domElement;

        // R3F gives the canvas its own `pointer-events: auto`, so the
        // wrapper's `none` is not inherited - opt out explicitly and let the
        // hover raycast switch it back on over a card.
        canvas.style.pointerEvents = "none";

        const handleMouseMove = (event) => {
            client.current = { x: event.clientX, y: event.clientY };
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("click", openCard);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("click", openCard);

            canvas.style.pointerEvents = "";
            canvas.style.cursor = "";
        };
    }, [gl, openCard]);

    useFrame(({ clock }, delta) => {
        const time = clock.getElapsedTime();
        const step = Math.min(delta, 1 / 30);

        // Re-derived every frame, not just on mousemove, so scrolling with a
        // still cursor keeps it lined up with the cards.
        if (client.current) toNdc(client.current.x, client.current.y);

        const settled =
            time >= DROP_DELAY + DROP_STAGGER * cards.length + DROP_DURATION;

        // Hover is tested against fixed invisible proxies, never the cards
        // themselves: raycasting the card would let the hover lift move it out
        // from under the cursor, which drops the hover, which drops the card -
        // an endless bounce.
        settledRef.current = settled;

        if (settled) {
            // No hover lift in the grid: on touch screens a tap would fire an
            // emulated mousemove and bounce the card right before it opens.
            const next = grid ? -1 : pick();

            if (next !== hovered.current) {
                hovered.current = next;

                gl.domElement.style.pointerEvents = next >= 0 ? "auto" : "none";
                gl.domElement.style.cursor = next >= 0 ? "pointer" : "";
            }
        }

        cardRefs.current.forEach((card, index) => {
            if (!card) return;

            const base = positions[index];

            let yaw;
            let pitch;

            if (grid) {
                const phase = index * SWIVEL_PHASE;

                yaw = Math.sin(time * SWIVEL_YAW_SPEED + phase) * SWIVEL_YAW;
                pitch =
                    Math.sin(time * SWIVEL_PITCH_SPEED + phase) * SWIVEL_PITCH;
            } else {
                // Each card leans toward the cursor on its own, based on where
                // it sits on screen rather than on one shared rig rotation.
                const ndc = scratch.set(base.x, base.y, base.z);

                card.parent.localToWorld(ndc);
                ndc.project(camera);

                yaw = THREE.MathUtils.clamp(
                    (mouse.current.x - ndc.x) * YAW_PER_NDC,
                    -MAX_TILT,
                    MAX_TILT,
                );

                pitch = THREE.MathUtils.clamp(
                    (mouse.current.y - ndc.y) * PITCH_PER_NDC,
                    -MAX_TILT,
                    MAX_TILT,
                );
            }

            card.rotation.y = THREE.MathUtils.lerp(card.rotation.y, yaw, 0.08);

            card.rotation.x = THREE.MathUtils.lerp(
                card.rotation.x,
                FACE_UP_X - pitch,
                0.08,
            );

            const progress = THREE.MathUtils.clamp(
                (time - DROP_DELAY - index * DROP_STAGGER) / DROP_DURATION,
                0,
                1,
            );

            const eased = 1 - Math.pow(1 - progress, 3);
            const drop = THREE.MathUtils.lerp(dropHeight, 0, eased);

            // Under-damped spring, so the hover reads as a bounce rather
            // than a slide.
            const spring = springs.current[index];
            const target = hovered.current === index ? HOVER_LIFT : 0;

            spring.velocity +=
                (target - spring.value) * HOVER_STIFFNESS * step -
                spring.velocity * HOVER_DAMPING * step;

            spring.value += spring.velocity * step;

            card.position.y = base.y + drop + spring.value;
        });
    });

    return (
        <group
            // Sit below the centred <h1> in the hero.
            position={[0, rigY, RIG_Z]}
            scale={scale}
        >
            {cards.map((card, index) => (
                <group key={card.objects[0].uuid}>
                    <group
                        ref={(node) => {
                            cardRefs.current[index] = node;
                        }}
                        position={positions[index]}
                        rotation={[FACE_UP_X, 0, 0]}
                    >
                        <group scale={CARD_SCALE}>
                            <group rotation={[0, FACE_CAMERA_Y, 0]}>
                                <group
                                    position={[
                                        -card.center.x,
                                        -card.center.y,
                                        -card.center.z,
                                    ]}
                                >
                                    {card.objects.map((object) => (
                                        <primitive
                                            key={object.uuid}
                                            object={object}
                                        />
                                    ))}
                                </group>
                            </group>
                        </group>
                    </group>

                    {/* Static hover target - deliberately not a child of the
                        animated card group. */}
                    <mesh
                        ref={(node) => {
                            hitRefs.current[index] = node;
                        }}
                        position={[
                            positions[index].x,
                            positions[index].y + HOVER_LIFT / 2,
                            positions[index].z,
                        ]}
                        visible={false}
                    >
                        <boxGeometry
                            args={[
                                card.hitSize.x,
                                card.hitSize.y,
                                card.hitSize.z,
                            ]}
                        />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

export default function FireLinksScene({ className = "" }) {
    return (
        <div className={`absolute inset-0 pointer-events-none ${className}`}>
            <Canvas
                camera={{
                    position: [0, 0, 10],
                    fov: 35,
                }}
                dpr={[1, 2]}
                gl={{
                    antialias: true,
                    alpha: true,
                }}
            >
                <ambientLight intensity={0.35} />

                {/* sharp yellow underglow */}
                <directionalLight
                    position={[0, -6, 3]}
                    intensity={3.2}
                    color="#ffc23a"
                />

                {/* white key from the left */}
                <directionalLight
                    position={[-7, 1.5, 5]}
                    intensity={2.4}
                    color="#ffffff"
                />

                <FireLinks />
            </Canvas>
        </div>
    );
}

useGLTF.preload(MODEL_URL);
