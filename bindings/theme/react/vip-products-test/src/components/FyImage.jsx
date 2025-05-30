import React, { useState, useEffect, useRef } from "react";
import { useGlobalStore } from "fdk-core/utils";
import { motion, useInView } from "framer-motion";

import { isRunningOnClient, transformImage } from "../../utils";

const FyImage = ({
  backgroundColor = "#ffffff",
  src = "",
  placeholder = "",
  alt = "",
  aspectRatio = 1,
  mobileAspectRatio = 1,
  showSkeleton = false,
  showOverlay = false,
  overlayColor = "#ffffff",
  sources = [
    { breakpoint: { min: 780 }, width: 1280 },
    { breakpoint: { min: 600 }, width: 1100 },
    { breakpoint: { min: 480 }, width: 1200 },
    { breakpoint: { min: 361 }, width: 900 },
    { breakpoint: { max: 360 }, width: 640 },
  ],
  isLazyLoaded = true,
  blurWidth = 50,
  customClass = "",
  overlayCustomClass = "",
  globalConfig,
  defer = true,
  isImageCover = false,
  onLoad, // Added onLoad prop for parent callback
}) => {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const imgWrapperRef = useRef(null);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isRunningOnClient()) {
      setIsClient(true);
    }
    const handleIntersection = (entries) => {
      if (entries?.[0]?.isIntersecting) {
        setIsIntersecting(true);
      }
    };

    const observer = new IntersectionObserver(handleIntersection);

    if (isLazyLoaded && imgWrapperRef.current) {
      observer.observe(imgWrapperRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [isLazyLoaded]);

  // Inline styles for the component
  const imageWrapperStyle = {
    overflow: "hidden",
    position: "relative",
    height: "100%",
    ...dynamicStyles,
  };

  const imageWrapperBeforeStyle = {
    content: '""',
    display: "block",
    paddingBottom: `calc(100% * calc(1 / ${mobileAspectRatio}))`,
    '@media (min-width: 768px)': {
      paddingBottom: `calc(100% * calc(1 / ${aspectRatio}))`,
    },
  };

  const pictureStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    backgroundColor: globalConfig?.img_container_bg || backgroundColor,
    height: "100%",
    width: "100%",
  };

  const overlayStyle = {
    position: "absolute",
    backgroundColor: overlayColor,
    zIndex: 1,
    opacity: 0.4,
    height: "100%",
    width: "100%",
    top: 0,
    left: 0,
  };

  const imgStyle = {
    width: "100%",
    height: "100%",
    objectFit: isImageCover || globalConfig?.img_fill ? "cover" : "contain",
    objectPosition: isImageCover || globalConfig?.img_fill ? "top" : "center",
    display: !showSkeleton || !isLoading ? "block" : "none",
  };

  const dynamicStyles = {
    "--aspect-ratio-desktop": `${aspectRatio}`,
    "--aspect-ratio-mobile": `${mobileAspectRatio}`,
    "--bg-color": `${globalConfig?.img_container_bg || backgroundColor}`,
  };

  const getSrc = () => {
    if (isLazyLoaded && !isIntersecting) {
      return transformImage(src, blurWidth);
    }

    if (isError) {
      return placeholder;
    }
    return transformImage(src);
  };

  function getImageType() {
    if (!src) return '';
    return src.split(/[#?]/)[0].split(".").pop().trim();
  }

  function isResizable() {
    const notResizableFormat = ["gif", "svg"];
    const imageType = getImageType();
    return imageType && !notResizableFormat.includes(imageType.toLowerCase());
  }

  const fallbackSrcset = () => {
    let url = src;

    if (!isResizable()) {
      return "";
    }

    if (isLazyLoaded && !isIntersecting) {
      return "";
    }

    if (isError) {
      url = placeholder;
    }

    return sources
      .map((s) => {
        const srcUrl = transformImage(url, s.width);
        return `${srcUrl} ${s.width}w`;
      })
      .join(", ");
  };

  const getLazyLoadSources = () =>
    sources?.map((source) => {
      // Create a copy to avoid mutating original
      const sourceCopy = { ...source };
      sourceCopy.media = getMedia(source);
      sourceCopy.srcset = getUrl(source.blurWidth ?? blurWidth, source.url);
      return sourceCopy;
    });

  const getSources = () => {
    return getLazyLoadSources().map((source) => {
      // Create a copy to avoid mutating
      const sourceCopy = { ...source };
      sourceCopy.srcset = getUrl(source.width, source.url);
      return sourceCopy;
    });
  };

  const getMedia = (source) => {
    if (source.breakpoint) {
      const min =
        (source.breakpoint.min && `(min-width: ${source.breakpoint.min}px)`) ||
        "";
      const max =
        (source.breakpoint.max && `(max-width: ${source.breakpoint.max}px)`) ||
        "";

      if (min && max) {
        return `${min} and ${max}`;
      }
      return min || max;
    }
    return "";
  };

  const getUrl = (width, url = src) => {
    if (!isResizable()) {
      return url || "";
    }

    if (isError) {
      url = placeholder;
    }

    return transformImage(url, width);
  };

  const onError = () => {
    if (isLazyLoaded && !isIntersecting) {
      return;
    }
    setIsError(true);
    setIsLoading(false);
  };

  const handleOnLoad = (e) => {
    setIsLoading(false);
    // Call parent's onLoad callback if provided
    if (onLoad) {
      onLoad(e);
    }
  };

  return (
    <div
      className={customClass}
      style={imageWrapperStyle}
      ref={imgWrapperRef}
    >
      {/* Aspect ratio placeholder */}
      <div
        style={{
          content: '""',
          display: "block",
          paddingBottom: window.innerWidth <= 768 
            ? `calc(100% / ${mobileAspectRatio})` 
            : `calc(100% / ${aspectRatio})`,
        }}
      />
      
      {showOverlay && (
        <div
          className={overlayCustomClass}
          style={overlayStyle}
        />
      )}
      
      <motion.div
        ref={ref}
        initial={isClient ? { opacity: 0, y: 15 } : {}}
        animate={
          isClient ? { opacity: isInView ? 1 : 0, y: isInView ? 0 : 15 } : {}
        }
        transition={{ duration: 0.8 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <picture style={pictureStyle}>
          {getSources().map((source, index) => (
            <source
              key={index}
              media={source.media}
              srcSet={source.srcset}
              type="image/webp"
            />
          ))}
          <img
            style={imgStyle}
            srcSet={fallbackSrcset()}
            src={getSrc()}
            alt={alt}
            onError={onError}
            onLoad={handleOnLoad}
            loading={defer ? "lazy" : "eager"}
            fetchPriority={defer ? "low" : "high"}
          />
        </picture>
      </motion.div>
    </div>
  );
};

export default FyImage;