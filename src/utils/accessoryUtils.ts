import React from 'react';

export const getAccessoryStyle = (itemId: string): React.CSSProperties => {
  const hats = ['top_hat', 'crown', 'cowboy_hat', 'party_hat', 'wizard_hat'];
  const glasses = ['sunglasses', 'cool_glasses'];
  const bowties = ['red_bowtie', 'blue_bowtie', 'tie'];
  const back = ['backpack'];
  
  if (hats.includes(itemId)) return { top: '5%', left: '50%', transform: 'translateX(-50%)', width: '120px' };
  if (glasses.includes(itemId)) return { top: '35%', left: '50%', transform: 'translateX(-50%)', width: '100px' };
  if (bowties.includes(itemId)) return { bottom: '25%', left: '50%', transform: 'translateX(-50%)', width: '60px' };
  if (back.includes(itemId)) return { bottom: '20%', right: '10%', width: '80px', zIndex: 5 };
  
  return { width: '80px' };
};
