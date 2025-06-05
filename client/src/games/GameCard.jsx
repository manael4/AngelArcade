const GameCard = ({ title, imageSrc, onClick }) => (
  <div className="gameCard_container" onClick={onClick}>
    {imageSrc && <img src={imageSrc} alt={title} className="gameCard_image" />}
    <h2 className="gameCard_title">{title}</h2>
  </div>
);

export default GameCard;
