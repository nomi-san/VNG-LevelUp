export const makeMockResponse = <T>(data: T): { data: T; ok: boolean; status: number } => {
  return { data, ok: true, status: 200 };
};
