import { IBreadcrumbItem } from '@fluentui/react';
import React from 'react';



interface CustomBreadcrumbProps {
  breadcrumbItems: IBreadcrumbItem[];
  setSelectedItem: (value: any) => void;
}

const CustomBreadcrumb: React.FC<CustomBreadcrumbProps> = ({
  breadcrumbItems,
  setSelectedItem,
}) => {
  // Show only the last 2 items
  const visibleItems = breadcrumbItems.slice(-2);

  const breadcrumbContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    color: '#007D7A',
  };

  const breadcrumbItemStyle: React.CSSProperties = {
    margin: '0 5px',
    fontWeight: 'bold',
    color: '#007D7A',
  };

  const handleClick = (item: IBreadcrumbItem) => {
    setSelectedItem(null);
    console.log(item, 'item')
    if(item.onClick)item.onClick()
  };

  return (
    <div style={breadcrumbContainerStyle}>
      {visibleItems.map((item, index) => (
        <span key={item.key} style={breadcrumbItemStyle}>
          {index < visibleItems.length - 1 ? (
            <button
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                fontSize: 'inherit',
                cursor: 'pointer',
              }}
              onClick={() => handleClick(item)}
            >
              {item.text}
            </button>
          ) : (
            item.text
          )}
          {index < visibleItems.length - 1 && ' > '}
        </span>
      ))}
    </div>
  );
};

export default CustomBreadcrumb;
