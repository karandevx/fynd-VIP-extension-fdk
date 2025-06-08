import React from "react";
import styles from "../styles/style.css";

export function ProductCard({ product, isVipOnly }) {
  const { name, slug, media, price, item_code, rating, short_description, brand } = product;
  const imageUrl = media && media.length > 0 ? media[0].url : '';
  const priceInfo = price?.effective;

  return (
    <div className={styles.productCard}>
      {isVipOnly && (
        <div className={styles.vipBadge || 'vipBadge'}>
          VIP Only
        </div>
      )}
      <img 
        src={imageUrl} 
        alt={name} 
        className={styles.productImage || 'productImage'} 
      />
      <div className={styles.productInfo || 'productInfo'}>
        <h3>{name}</h3>
        {brand && <p className={styles.brand || 'brand'}>{brand.name}</p>}
        {item_code && <p className={styles.itemCode || 'itemCode'}>Item Code: {item_code}</p>}
        {short_description && <p className={styles.description || 'description'}>{short_description}</p>}
        {rating && <p className={styles.rating || 'rating'}>Rating: {rating}/5</p>}
        {priceInfo && (
          <p className={styles.price || 'price'}>
            {priceInfo.currency_symbol}{priceInfo.min}
          </p>
        )}
        {isVipOnly && (
          <p className={styles.vipMessage || 'vipMessage'}>
            Available with VIP membership
          </p>
        )}
      </div>
    </div>
  );
}
