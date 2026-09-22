import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Circle, Line, Polygon } from 'react-native-svg';

interface NagadCartLogoProps {
  width?: number;
  height?: number;
  showBrandText?: boolean;
}

export const NagadCartLogo: React.FC<NagadCartLogoProps> = ({
  width = 140,
  height = 95,
  showBrandText = true,
}) => {
  return (
    <View style={styles.container}>
      {/* 100% Exact Shopping Cart with Packages & Motion Pixels */}
      <Svg
        width={width}
        height={height}
        viewBox="0 0 140 95"
        fill="none"
      >
        {/* ============================================================ */}
        {/* LEFT PIXEL SQUARES (Motion trail on left)                    */}
        {/* ============================================================ */}
        <Rect x="8" y="50" width="5" height="5" fill="#ffffff" opacity={0.95} />
        <Rect x="16" y="56" width="3.5" height="3.5" fill="#ffffff" opacity={0.9} />
        <Rect x="6" y="60" width="4" height="4" fill="#ffffff" opacity={0.8} />
        <Rect x="20" y="62" width="3" height="3" fill="#ffffff" opacity={0.95} />
        <Rect x="13" y="66" width="4.5" height="4.5" fill="#ffffff" opacity={0.85} />
        <Rect x="24" y="54" width="3.5" height="3.5" fill="#ffffff" opacity={0.9} />
        <Rect x="28" y="60" width="4" height="4" fill="#ffffff" opacity={0.95} />

        {/* ============================================================ */}
        {/* RIGHT PIXEL SQUARES (Speed sparkles on right)               */}
        {/* ============================================================ */}
        <Rect x="100" y="44" width="4" height="4" fill="#ffffff" opacity={0.95} />
        <Rect x="108" y="46" width="3" height="3" fill="#ffffff" opacity={0.85} />
        <Rect x="102" y="52" width="4.5" height="4.5" fill="#ffffff" opacity={0.95} />
        <Rect x="110" y="55" width="3.5" height="3.5" fill="#ffffff" opacity={0.9} />
        <Rect x="104" y="61" width="4" height="4" fill="#ffffff" opacity={0.95} />
        <Rect x="96" y="65" width="3" height="3" fill="#ffffff" opacity={0.85} />
        <Rect x="112" y="62" width="3.5" height="3.5" fill="#ffffff" opacity={0.8} />

        {/* ============================================================ */}
        {/* SHOPPING BAG 1 (Back / Left tilted bag)                     */}
        {/* ============================================================ */}
        {/* Bag 1 Handle (Arched loop) */}
        <Path
          d="M 54 13 C 54 7, 64 7, 64 13"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Bag 1 Body */}
        <Polygon
          points="46,16 70,13 76,38 52,41"
          fill="#ffffff"
          stroke="#9c1017"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* ============================================================ */}
        {/* SHOPPING BAG 2 (Front / Right bag)                          */}
        {/* ============================================================ */}
        {/* Bag 2 Handles (Double arched loop) */}
        <Path
          d="M 72 17 C 72 11, 82 11, 82 17"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M 78 17 C 78 11, 88 11, 88 17"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Bag 2 Body */}
        <Polygon
          points="62,19 90,17 92,44 64,46"
          fill="#f1f2f4"
          stroke="#9c1017"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* ============================================================ */}
        {/* CART HANDLE (Upper-left: horizontal bar and angled drop)    */}
        {/* ============================================================ */}
        <Path
          d="M 22 26 L 34 26 L 40 42"
          stroke="#ffffff"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* ============================================================ */}
        {/* CART BASKET WIREFRAME                                       */}
        {/* ============================================================ */}
        {/* Outer Basket Border (Trapezoid) */}
        <Path
          d="M 36 42 L 96 42 L 88 68 L 44 68 Z"
          stroke="#ffffff"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Horizontal Wire Bars */}
        <Line
          x1="39"
          y1="51"
          x2="93"
          y2="51"
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <Line
          x1="42"
          y1="60"
          x2="90"
          y2="60"
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Slanted Vertical Grid Ribs */}
        <Line
          x1="57"
          y1="42"
          x2="55"
          y2="68"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Line
          x1="75"
          y1="42"
          x2="73"
          y2="68"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* ============================================================ */}
        {/* CART WHEELS (Two hollow circular rings)                     */}
        {/* ============================================================ */}
        <Circle
          cx="51"
          cy="78"
          r="5"
          stroke="#ffffff"
          strokeWidth="2.8"
          fill="none"
        />
        <Circle
          cx="79"
          cy="78"
          r="5"
          stroke="#ffffff"
          strokeWidth="2.8"
          fill="none"
        />
      </Svg>

      {/* Brand Typography & Signature Curved Swoosh Underline */}
      {showBrandText && (
        <View style={styles.brandWrapper}>
          <Text style={styles.brandText}>
            <Text style={styles.brandBold}>Mobi</Text>
            <Text style={styles.brandLight}>xa</Text>
          </Text>
          {/* Signature curved swoosh underline */}
          <Svg width={100} height={10} viewBox="0 0 100 10" fill="none" style={styles.swooshSvg}>
            <Path
              d="M 4 3 Q 50 11, 96 3"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandWrapper: {
    alignItems: 'center',
    marginTop: 2,
  },
  brandText: {
    fontSize: 20,
    letterSpacing: 0.5,
  },
  brandBold: {
    color: '#ffffff',
    fontWeight: '800',
  },
  brandLight: {
    color: '#ffffff',
    fontWeight: '300',
    fontStyle: 'italic',
  },
  swooshSvg: {
    marginTop: 1,
  },
});

export default NagadCartLogo;
