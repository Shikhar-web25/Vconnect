/**
 * Vconnect Avatar System — LOCAL IMAGES
 *
 * 10 preset avatars: 5 male, 5 female.
 * Located in: src/assets/avatars/male/ and src/assets/avatars/female/
 *
 * To change avatars, just replace the PNG files keeping the same filenames.
 * React Native require() is resolved at build time, so restart Metro after swapping files.
 */
import { ImageSourcePropType } from 'react-native';

// ─── Male avatars (local PNGs) ───────────────────────────
export const MALE_AVATARS: ImageSourcePropType[] = [
    require('../assets/avatars/male/male_1.png'),
    require('../assets/avatars/male/male_2.png'),
    require('../assets/avatars/male/male_3.png'),
    require('../assets/avatars/male/male_4.png'),
    require('../assets/avatars/male/male_5.png'),
];

// ─── Female avatars (local PNGs) ─────────────────────────
export const FEMALE_AVATARS: ImageSourcePropType[] = [
    require('../assets/avatars/female/female_1.png'),
    require('../assets/avatars/female/female_2.png'),
    require('../assets/avatars/female/female_3.png'),
    require('../assets/avatars/female/female_4.png'),
    require('../assets/avatars/female/female_5.png'),
];

export const ALL_AVATARS: ImageSourcePropType[] = [...MALE_AVATARS, ...FEMALE_AVATARS];

/** Get a male avatar by index (wraps around) */
export const getMaleAvatar = (index: number): ImageSourcePropType =>
    MALE_AVATARS[index % MALE_AVATARS.length];

/** Get a female avatar by index (wraps around) */
export const getFemaleAvatar = (index: number): ImageSourcePropType =>
    FEMALE_AVATARS[index % FEMALE_AVATARS.length];
