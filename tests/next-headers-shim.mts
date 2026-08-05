type AuraTestState = typeof globalThis & {
  __auraDemoCookieValue?: string;
};

export async function cookies() {
  return {
    get(name: string) {
      const value = (globalThis as AuraTestState).__auraDemoCookieValue;
      return value === undefined ? undefined : { name, value };
    },
  };
}
