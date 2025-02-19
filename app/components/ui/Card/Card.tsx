import React from 'react';
import styles from './Card.module.scss';

interface CardProps {
  title: string;
  description?: string;
  animated?: boolean;
  interactive?: boolean;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  title,
  description,
  animated = false,
  interactive = false,
  children,
  footer,
  onClick,
}) => {
  return (
    <div
      className={styles.card}
      data-animated={animated}
      data-interactive={interactive}
      onClick={interactive ? onClick : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>{title}</h3>
        </div>

        {description && <p className={styles.cardDescription}>{description}</p>}

        {children}

        {footer && <div className={styles.cardFooter}>{footer}</div>}
      </div>
    </div>
  );
};

interface CardGridProps {
  children: React.ReactNode;
}

export const CardGrid: React.FC<CardGridProps> = ({ children }) => {
  return <div className={styles.cardGrid}>{children}</div>;
};
