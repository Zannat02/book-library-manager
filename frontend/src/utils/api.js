
export async function request(url, options = {}) {
    let response;

    try {
        response = await fetch(url, options);
    } catch (err) {
        if (err.name === 'AbortError') throw err;
        throw new Error('Could not connect to the server. Please try again.');
    }

    const contentType = response.headers.get('content-type') || '';

    if (!contentType.includes('application/json')) {
        throw new Error(
            'The server returned an unexpected response. Check that the backend is running.'
        );
    }

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || 'Request failed.');
    }

    return result;
}