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

type InstanceKey = string | number | {iterator: string[], params: Record<string, string | number>};

function buildUrl(baseUrl: string, instance?: InstanceKey) {
    if (instance == null ) {
        return baseUrl;
    }
    else if (typeof instance === "number" || typeof instance === "string") {
        return `${baseUrl}${instance}/`;

    }
    else {
        const params = []

        for (const key of instance.iterator) {
            params.push(instance.params[key])
        }

        return `${baseUrl}${params.join("-")}/`;
    }
}

export async function rpcCall(url: string, input: Record<string, any>, type: "form" | "form_set", instance?: InstanceKey): Promise<Result<any, any>> {
    const formData = new FormData();

    if (type === "form_set") {
        formData.append("form_set-INITIAL_FORMS", input.length);
        formData.append("form_set-TOTAL_FORMS", input.length);
        for (const index in (input as Array<any>)) {
            const formSetForm = input[index];
            Object.keys(formSetForm).forEach((key) => formData.append(`form_set-${index}-${key}`, formSetForm[key]));
        }
    }
    else {
        Object.keys(input).forEach(key => formData.append(key, input[key as keyof typeof input] ?? ""));
    }

    const urlWithPossibleInstance = buildUrl(url, instance);

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
