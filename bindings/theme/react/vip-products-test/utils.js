import Pixelbin, { transformations } from "@pixelbin/core";

export const debounce = (func, wait) => {
  let timeout;
  const debouncedFunction = (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(function applyFunc() {
      func.apply(this, args);
    }, wait);
  };
  return debouncedFunction;
};

export const getGlobalConfigValue = (globalConfig, id) =>
  globalConfig?.props?.[id] ?? "";

export const getSocialIcon = (title) =>
  title && typeof title === "string" ? `footer-${title.toLowerCase()}` : "";

export function replaceQueryPlaceholders(queryFormat, value1, value2) {
  return queryFormat.replace("{}", value1).replace("{}", value2);
}

export const singleValuesFilters = {
  sortOn: true,
};

export function capitalize(str) {
  if (!str) return str; // Return the string as-is if it's empty or undefined
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export const numberWithCommas = (number) => {
  let num = number;
  if (number?.toString()[0] === "-") {
    num = number.toString().substring(1);
  }

  if (num) {
    let no =
      num.toString().split(".")[0].length > 3
        ? `${num
            .toString()
            .substring(0, num.toString().split(".")[0].length - 3)
            .replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${num
            .toString()
            .substring(num.toString().split(".")[0].length - 3)}`
        : num.toString();

    if (number.toString()[0] === "-") {
      no = `-${no}`;
    }
    return no;
  }
  return 0;
};
export function isRunningOnClient() {
  if (typeof window !== "undefined") {
    return globalThis === window;
  }

  return false;
}

export const copyToClipboard = (str) => {
  const el = document.createElement("textarea");
  el.value = str;
  el.setAttribute("readonly", "");
  el.style.position = "absolute";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  const selected =
    document.getSelection().rangeCount > 0
      ? document.getSelection().getRangeAt(0)
      : false;
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
  if (selected) {
    document.getSelection().removeAllRanges();
    document.getSelection().addRange(selected);
  }
};

export function isValidPincode(value) {
  value = value.trim();
  if (value.length === 0) {
    return false;
  }
  const re = /^(?=.{2,11}$)[a-z0-9]+([ -]?[a-z0-9]+)*$/i;
  const testPincode = re.test(value);
  if (!testPincode) {
    return false;
  }
  return true;
}

export function convertDate(dateString) {
  const date = new Date(dateString);

  const options = {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone: "UTC",
  };

  const formatter = new Intl.DateTimeFormat("en-US", options);
  const formattedDate = formatter.format(date);

  return formattedDate;
}

export const convertUTCDateToLocalDate = (date, format) => {
  let frm = format;
  if (!frm) {
    frm = {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
  }
  const utcDate = new Date(date);
  // Convert the UTC date to the local date using toLocaleString() with specific time zone
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const options = {
    ...frm,
    timeZone: browserTimezone,
  };
  // Convert the UTC date and time to the desired format
  const formattedDate = utcDate
    .toLocaleString("en-US", options)
    .replace(" at ", ", ");
  return formattedDate;
};

export function validateName(name) {
  const regexp = /^[a-zA-Z0-9-_'. ]+$/;
  return regexp.test(String(name).toLowerCase().trim());
}

export function validateEmailField(value) {
  const emailPattern =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailPattern.test(value);
}

export function validatePhone(phoneNo) {
  const re = /^[0-9]{10}$/;
  return phoneNo && phoneNo.length && re.test(phoneNo.trim());
}

export function validatePasswordField(value) {
  const passwordPattern =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[`~\!@#\$%\^\&\*\(\)\-_\=\+\[\{\}\]\\|;:\'",<.>\/\?€£¥₹§±])[A-Za-z\d`~\!@#\$%\^\&\*\(\)\-_\=\+\[\{\}\]\\|;:\'",<.>\/\?€£¥₹§±]{8,}$/;
  return passwordPattern.test(value);
}

export function checkIfNumber(value) {
  const numberPattern = /^[0-9]+$/;
  return numberPattern.test(value);
}

export function isEmptyOrNull(obj) {
  return (
    obj === null ||
    obj === undefined ||
    (typeof obj === "object" && Object.keys(obj).length === 0)
  );
}

export const transformImage = (url, width) => {
  let updatedUrl = url;
  try {
    const obj = Pixelbin.utils.urlToObj(url);
    if (width) {
      const pixelbin = new Pixelbin({
        cloudName: obj.cloudName,
        zone: obj.zone || "default",
      });

      const resizeTransformation = transformations.Basic.resize({
        width,
        dpr: 1,
      });

      updatedUrl = pixelbin
        .image(obj.workerPath)
        .setTransformation(resizeTransformation)
        .getUrl();
    }
  } catch (error) {
    console.warn("Error processing the URL:", error.message);
  }
  return updatedUrl;
};

export function updateGraphQueryWithValue(mainString, replacements) {
  if (!mainString || !replacements || !Array.isArray(replacements)) {
    return mainString;
  }
  let mStr = mainString;
  // Iterate over the replacements and replace each occurrence in the main string
  replacements.forEach((replacement) => {
    const [search, replaceWith] = replacement;
    if (search && replaceWith) {
      mStr = mainString.split(search).join(replaceWith);
    }
  });
  return mStr;
}

export function throttle(func, wait) {
  let waiting = false;

  function throttleHandler(...args) {
    if (waiting) {
      return;
    }

    waiting = true;
    setTimeout(function executeFunction() {
      func.apply(this, args);
      waiting = false;
    }, wait);
  }

  return throttleHandler;
}

export const detectMobileWidth = () => {
  if (isRunningOnClient()) {
    if (window && window.screen?.width <= 768) {
      return true;
    }
    return false;
  }
};

export const getProductImgAspectRatio = (
  global_config,
  defaultAspectRatio = 0.8
) => {
  const productImgWidth = global_config?.product_img_width;
  const productImgHeight = global_config?.product_img_height;
  if (productImgWidth && productImgHeight) {
    const aspectRatio = Number(productImgWidth / productImgHeight).toFixed(2);
    return aspectRatio >= 0.6 && aspectRatio <= 1
      ? aspectRatio
      : defaultAspectRatio;
  }

  return defaultAspectRatio;
};

