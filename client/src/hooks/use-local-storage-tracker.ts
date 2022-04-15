import { useAppStore, AppStore } from "stores/appStore";

const useLocalStorageTracker = () => {
  const logout = useAppStore((state: AppStore) => state.logout);
  const listen = () => window.addEventListener('storage', handleChangesInLocalStorage);

  const handleChangesInLocalStorage = (e: StorageEvent) => {
    const authKeys = ["loggedInUser", "token"];
    const { oldValue, newValue } = e;

    if (localStorage.length === 0 || (e.key && (authKeys.includes(e.key) && newValue !== oldValue))) {
      logout();
    }
  };

  return { listen };
};

export default useLocalStorageTracker;