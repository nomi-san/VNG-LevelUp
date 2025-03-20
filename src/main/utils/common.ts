function toSnake(s: string): string {
  return s.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function param(params: object, method: "GET" | "POST" = "GET"): string {
  const fields: string[] = [];
  Object.keys(params).forEach((key) => {
    fields.push(
      encodeURIComponent(method === "GET" ? toSnake(key) : key) +
        "=" +
        encodeURIComponent(String(params[key])),
    );
  });
  return fields.join("&");
}

export function makeParams(data: object, method: "GET" | "POST" = "GET"): string {
  let params = "";
  if (typeof data === "object" && data !== null) {
    params = param(data, method);
  } else {
    if (data) {
      params = data;
    }
  }
  return params;
}
