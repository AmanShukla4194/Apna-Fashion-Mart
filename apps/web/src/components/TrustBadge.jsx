
import React from 'react';

const TrustBadge = ({ icon: Icon, title, description }) => {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-card rounded-2xl border border-border/50 hover:border-secondary hover:shadow-lg transition-all duration-300">
      <div className="w-14 h-14 bg-accent text-secondary rounded-full flex items-center justify-center mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-base font-bold text-primary mb-2 font-serif">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default TrustBadge;
