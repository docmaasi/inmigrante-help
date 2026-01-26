const isNode = typeof window === 'undefined';

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
	if (isNode) {
		return defaultValue;
	}
	const urlParams = new URLSearchParams(window.location.search);
	const searchParam = urlParams.get(paramName);
	if (removeFromUrl && searchParam) {
		urlParams.delete(paramName);
		const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}${window.location.hash}`;
		window.history.replaceState({}, document.title, newUrl);
	}
	return searchParam ?? defaultValue ?? null;
};

const getAppParams = () => {
	return {
		appUrl: getAppParamValue('app_url', { defaultValue: import.meta.env.VITE_APP_URL }),
		supabaseUrl: getAppParamValue('supabase_url', { defaultValue: import.meta.env.VITE_SUPABASE_URL }),
		fromUrl: getAppParamValue('from_url', { defaultValue: isNode ? '' : window.location.href }),
	};
};

export const appParams = {
	...getAppParams(),
};
