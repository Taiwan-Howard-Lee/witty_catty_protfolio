import './LoadingSpinner.css';

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner">
        <div className="spinner-circle"></div>
        <div className="cat-face">
          <div className="cat-ears">
            <div className="ear left"></div>
            <div className="ear right"></div>
          </div>
          <div className="cat-eyes">
            <div className="eye left"></div>
            <div className="eye right"></div>
          </div>
          <div className="cat-nose"></div>
          <div className="cat-mouth"></div>
        </div>
      </div>
      <p>Loading...</p>
    </div>
  );
};

export default LoadingSpinner;
