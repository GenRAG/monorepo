export type Override<Other extends object, Custom extends object> = Omit<Other, keyof Custom> & Custom;
