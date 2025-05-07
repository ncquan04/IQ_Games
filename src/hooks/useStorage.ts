import { MMKVLoader, useMMKVStorage } from "react-native-mmkv-storage"

const MMKV = new MMKVLoader().initialize(); // Initialize MMKV storage

export const useStorage = (key: string, defaultValue: any) => {
    const [value, setValue] = useMMKVStorage(key, MMKV, defaultValue);
    return [value, setValue];
}