const InfoCard = ({ icon: Icon, label, value, unit }) => {
    return (
      <div className="single-card">
        {Icon && <Icon className="info-card--icon" />}
        <div className="key-value--info">
          <div>{label}</div>
          <div>{value}{unit}</div>
        </div>
      </div>
    );
  };
  
  export default InfoCard;
  