// @ts-nocheck
import { Canvas, useFrame, useLoader } from "@react-three/fiber/native";
import { useState, useRef, Suspense, useLayoutEffect, useEffect } from "react";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { TextureLoader, Renderer } from "expo-three";
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
} from "react-native-reanimated";
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from "react-native-gesture-handler";

import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useAnimatedStyle } from "react-native-reanimated";
import { withTiming } from "react-native-reanimated";

function Box({
  args,
  imageOnSide,
  position,
  translateY,
  translateX,
  active,
  onPress,
}) {
  const dimensions = useWindowDimensions();

  const currentX = useSharedValue(0);
  const currentY = useSharedValue(0);

  const mesh = useRef();

  useFrame((state, delta) => {
    if (!active) return;

    const calculateY = -translateY.value * 0.01 + currentY.value;
    const calculateX = translateX.value * 0.01 + currentX.value;

    if (
      mesh.current.position.y !== calculateY ||
      mesh.current.position.x !== calculateX
    ) {
      if (mesh.current.position.y !== calculateY) {
        mesh.current.position.y = calculateY;
      }
      if (mesh.current.position.x !== calculateX) {
        mesh.current.position.x = calculateX;
      }
    }
  });

  useEffect(() => {
    if (!active) {
      console.log("alo");
      currentX.value = mesh.current.position.x;
      currentY.value = mesh.current.position.y;
    } else {
      translateY.value = currentY.value;
      translateX.value = currentX.value;
    }
  }, [active]);

  return (
    <mesh
      ref={mesh}
      scale={active ? 1 : 0.9}
      onClick={(event) => onPress(!active)}
    >
      <mesh position={position}>
        <boxGeometry args={args} />
        <meshPhysicalMaterial color={active ? "white" : "gray"} />
      </mesh>
      {!!imageOnSide && (
        <mesh position={[position[0], position[1], args[2] / 2]}>
          <boxGeometry args={[args[0], args[1], 0]} />
          <meshStandardMaterial map={imageOnSide} />
        </mesh>
      )}
    </mesh>
  );
}

function Shoe(props) {
  const [base, normal, rough] = useLoader(TextureLoader, [
    require("../../../assets/Airmax/textures/BaseColor.jpg"),
    require("../../../assets/Airmax/textures/Normal.jpg"),
    require("../../../assets/Airmax/textures/Roughness.png"),
  ]);
  const material = useLoader(
    MTLLoader,
    require("../../../assets/Airmax/shoeMaterial.mtl")
  );
  const obj = useLoader(
    OBJLoader,
    require("../../../assets/Airmax/nike.obj"),
    (loader) => {
      material.preload();
      loader.setMaterials(material);
    }
  );

  const mesh = useRef();

  useLayoutEffect(() => {
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material.map = base;
        child.material.normalMap = normal;
        child.material.roughnessMap = rough;
      }
    });
  }, [obj]);

  useFrame((state, delta) => {
    mesh.current.rotation.y += 0.01;
    mesh.current.rotation.z = 0;
  });

  return (
    <mesh ref={mesh} position={props.position} rotation={[0, 0, 0]}>
      <primitive object={obj} scale={10} />
    </mesh>
  );
}

export default function MainScreen() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const [active, setActive] = useState(-2);

  // const scrollHandler = useAnimatedScrollHandler((event) => {
  //   translateX.value = event.contentOffset.x;
  // });

  const base = useLoader(
    TextureLoader,
    require("../../../assets/Cards/Ace.png")
  );

  const baseH = useLoader(
    TextureLoader,
    require("../../../assets/Cards/AceH.png")
  );

  const opacityShared = useSharedValue(0);
  const opacitySharedTimed = useSharedValue(0);
  const opacitySharedShoeText = useSharedValue(0);

  const opacityAnimated = useAnimatedStyle(() => {
    return {
      opacity: withTiming(opacityShared.value, {
        duration: 1000,
      }),
    };
  });
  const opacityAnimatedTimed = useAnimatedStyle(() => {
    return {
      opacity: withTiming(opacitySharedTimed.value, {
        duration: 1000,
      }),
    };
  });
  const opacityAnimatedShoeText = useAnimatedStyle(() => {
    return {
      opacity: withTiming(opacitySharedShoeText.value, {
        duration: 1000,
      }),
    };
  });

  useEffect(() => {
    if (active !== -2) {
      setTimeout(() => {
        opacityShared.value = 1;
      }, 1500);
      setTimeout(() => {
        opacitySharedShoeText.value = 1;
      }, 5500);
      opacitySharedTimed.value = 1;
    }
  }, [active]);

  const panGestureEvent =
    useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
      onStart: (event, ctx) => {
        ctx.startX = translateX.value;
        ctx.startY = translateY.value;
      },
      onActive: (event, ctx) => {
        translateX.value = ctx.startX + event.translationX;
        translateY.value = ctx.startY + event.translationY;
      },
      onEnd: (event, ctx) => {},
    });

  const cards = [
    { id: 1, startPosition: [1, -2, 0], imageOnSide: base },
    { id: 2, startPosition: [0, -2, 0], imageOnSide: baseH },
  ];

  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PanGestureHandler onGestureEvent={panGestureEvent}>
          <Animated.View style={{ flex: 1 }}>
            <Text
              style={{
                position: "absolute",
                top: 100,
                width: "100%",
                textAlign: "center",
                fontSize: 24,
              }}
            >
              Press on card and move it
            </Text>
            <Animated.Text
              style={[
                {
                  position: "absolute",
                  top: 130,
                  width: "100%",
                  textAlign: "center",
                  fontSize: 24,
                },
                opacityAnimatedTimed,
              ]}
            >
              by the way
            </Animated.Text>
            <Animated.Text
              style={[
                {
                  position: "absolute",
                  top: 160,
                  width: "100%",
                  textAlign: "center",
                  fontSize: 24,
                },
                opacityAnimated,
              ]}
            >
              its 3d by three.js
            </Animated.Text>

            <Animated.View style={opacityAnimatedShoeText}>
              <Animated.Text
                style={[
                  {
                    position: "absolute",
                    top: 190,
                    width: "100%",
                    textAlign: "center",
                    fontSize: 24,
                  },
                ]}
              >
                Check out this nike shoe
              </Animated.Text>
              <Suspense fallback={null}>
                <Canvas
                  style={{
                    width: "100%",
                    height: 400,
                    position: "absolute",
                    top: 220,
                  }}
                >
                  <ambientLight />
                  <directionalLight color="white" position={[0, 0, 5]} />
                  <Shoe position={[0, 0.5, 1.5]}></Shoe>
                </Canvas>
              </Suspense>
            </Animated.View>

            <Canvas
              style={{
                flex: 1,
              }}
            >
              <ambientLight />
              <directionalLight color="white" position={[0, 0, 5]} />
              {cards.map((item) => (
                <Box
                  onPress={() => setActive(item.id === active ? -1 : item.id)}
                  active={item.id === active}
                  translateY={translateY}
                  translateX={translateX}
                  position={item.startPosition}
                  args={[1.5, 2.3, 0.01]}
                  imageOnSide={item.imageOnSide}
                ></Box>
              ))}
            </Canvas>
          </Animated.View>
        </PanGestureHandler>
      </GestureHandlerRootView>

      {/* 
      <FlatList
        data={Array.from({ length: 10 })}
        renderItem={() => {
          return (
            <View style={{ height: 300 }}>
              <Text>test</Text>
            </View>
          );
        }}
      ></FlatList> */}
    </>
  );
}
