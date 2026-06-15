def handle_error(error):
    error_msg = str(error)

    if "429" in error_msg:
        return "ERROR 429: Too Many Requests (Rate Limit Exceeded)"

    elif "API key" in error_msg or "api_key" in error_msg:
        return "Invalid API Key"

    elif "400" in error_msg:
        return "ERROR 400: Bad Request"

    elif "401" in error_msg:
        return "ERROR 401: Unauthorized"

    elif "403" in error_msg:
        return "ERROR 403: Forbidden"

    elif "404" in error_msg:
        return "ERROR 404: Not Found"

    elif "500" in error_msg:
        return "ERROR 500: Internal Server Error"

    elif "502" in error_msg:
        return "ERROR 502: Bad Gateway"

    elif "503" in error_msg:
        return "ERROR 503: Service Unavailable"

    elif "504" in error_msg:
        return "ERROR 504: Gateway Timeout"

    return f"Unexpected Error: {error_msg}"