// 41 cartoon boy/girl portraits (AI generated)
import a01 from "@/assets/avatars/01.png";
import a02 from "@/assets/avatars/02.png";
import a03 from "@/assets/avatars/03.png";
import a04 from "@/assets/avatars/04.png";
import a05 from "@/assets/avatars/05.png";
import a06 from "@/assets/avatars/06.png";
import a07 from "@/assets/avatars/07.png";
import a08 from "@/assets/avatars/08.png";
import a09 from "@/assets/avatars/09.png";
import a10 from "@/assets/avatars/10.png";
import a11 from "@/assets/avatars/11.png";
import a12 from "@/assets/avatars/12.png";
import a13 from "@/assets/avatars/13.png";
import a14 from "@/assets/avatars/14.png";
import a15 from "@/assets/avatars/15.png";
import a16 from "@/assets/avatars/16.png";
import a17 from "@/assets/avatars/17.png";
import a18 from "@/assets/avatars/18.png";
import a19 from "@/assets/avatars/19.png";
import a20 from "@/assets/avatars/20.png";
import a21 from "@/assets/avatars/21.png";
import a22 from "@/assets/avatars/22.png";
import a23 from "@/assets/avatars/23.png";
import a24 from "@/assets/avatars/24.png";
import a25 from "@/assets/avatars/25.png";
import a26 from "@/assets/avatars/26.png";
import a27 from "@/assets/avatars/27.png";
import a28 from "@/assets/avatars/28.png";
import a29 from "@/assets/avatars/29.png";
import a30 from "@/assets/avatars/30.png";
import a31 from "@/assets/avatars/31.png";
import a32 from "@/assets/avatars/32.png";
import a33 from "@/assets/avatars/33.png";
import a34 from "@/assets/avatars/34.png";
import a35 from "@/assets/avatars/35.png";
import a36 from "@/assets/avatars/36.png";
import a37 from "@/assets/avatars/37.png";
import a38 from "@/assets/avatars/38.png";
import a39 from "@/assets/avatars/39.png";
import a40 from "@/assets/avatars/40.png";
import a41 from "@/assets/avatars/41.png";

export type Avatar = { id: number; image: string; label: string; color: string };

const data: Array<[string, string, string]> = [
  [a01, "Aarav", "neon-cyan"],
  [a02, "Maya", "neon-pink"],
  [a03, "Leo", "neon-cyan"],
  [a04, "Lily", "neon-yellow"],
  [a05, "Kenji", "neon-pink"],
  [a06, "Sakura", "neon-pink"],
  [a07, "Jamal", "neon-green"],
  [a08, "Zara", "neon-purple"],
  [a09, "Arjun", "neon-yellow"],
  [a10, "Priya", "neon-cyan"],
  [a11, "Diego", "neon-yellow"],
  [a12, "Sofia", "neon-pink"],
  [a13, "Finn", "neon-green"],
  [a14, "Ruby", "neon-pink"],
  [a15, "Jake", "neon-cyan"],
  [a16, "Ella", "neon-purple"],
  [a17, "Oliver", "neon-cyan"],
  [a18, "Chloe", "neon-yellow"],
  [a19, "Max", "neon-pink"],
  [a20, "Hazel", "neon-green"],
  [a21, "Ravi", "neon-cyan"],
  [a22, "Mia", "neon-pink"],
  [a23, "Ben", "neon-cyan"],
  [a24, "Luna", "neon-purple"],
  [a25, "Eli", "neon-yellow"],
  [a26, "Ava", "neon-pink"],
  [a27, "Axel", "neon-yellow"],
  [a28, "Nora", "neon-yellow"],
  [a29, "Kai", "neon-green"],
  [a30, "Iris", "neon-pink"],
  [a31, "Tom", "neon-cyan"],
  [a32, "Emma", "neon-pink"],
  [a33, "Lars", "neon-cyan"],
  [a34, "Yumi", "neon-purple"],
  [a35, "Sam", "neon-yellow"],
  [a36, "Zoe", "neon-pink"],
  [a37, "Omar", "neon-yellow"],
  [a38, "Aisha", "neon-pink"],
  [a39, "Rex", "neon-green"],
  [a40, "Mint", "neon-green"],
  [a41, "Theo", "neon-yellow"],
];

export const AVATARS: Avatar[] = data.map(([image, label, color], i) => ({
  id: i,
  image,
  label,
  color,
}));
