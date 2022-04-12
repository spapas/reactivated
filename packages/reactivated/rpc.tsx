// But this one lets us specify the cookie string rather than always
// looking at document.cookie.
export function getCookieFromCookieString(name: string, cookieString: string) {
    let cookieValue = null;
    if (cookieString && cookieString != "") {
        const cookies = cookieString.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();

            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == name + "=") {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }

    return cookieValue;
}

export async function rpcCall(url: string, input: Record<string, any>, instance?: string | number): Promise<Result<any, any>> {
    const formData = new FormData();
    Object.keys(input).forEach(key => formData.append(key, input[key as keyof typeof input] ?? ""));

    const urlWithPossibleInstance = instance != null ? `${url}${instance}/` : url;

    try {
        const response = await fetch(urlWithPossibleInstance, {
            method: "POST",
            body: formData,
            headers: {
                Accept: "application/json",
                "X-CSRFToken":
                    getCookieFromCookieString("csrftoken", document.cookie) ?? "",
            },
        });

        if (response.status === 200) {
            return {
                type: "success",
                data: await response.json(),
            }
        }
        else if (response.status === 400) {
            return {
                type: "invalid",
                errors: await response.json(),
            }
        }

        throw new Error("Unknown status code");
    }
    catch (exception: unknown) {
        return {
            type: "exception",
            exception,
        }
    }
}

export type Result<TSuccess, TInvalid> = {
    type: "success",
    data:  TSuccess,
} | {
    type: "invalid",
    errors: TInvalid,
} | {
    type: "exception",
    exception: unknown,
}
