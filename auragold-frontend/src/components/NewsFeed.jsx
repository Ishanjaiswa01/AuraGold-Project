import React from 'react';

const getSentimentClass = (sentiment) => {
  if (sentiment === 'Positive') return 'sentiment-positive';
  if (sentiment === 'Negative') return 'sentiment-negative';
  return 'sentiment-neutral';
};

function NewsFeed({ newsData }) {
  return (
    <div className="news-feed-container">
      <h3>Market News & Insights</h3>
      <div className="news-list">
        {newsData.map(article => (
          <div key={article.id} className="news-item">
            <div className="news-header">
              <span>{article.source} • {article.time}</span>
              <span className={`sentiment-tag ${getSentimentClass(article.sentiment)}`}>
                {article.sentiment}
              </span>
            </div>
            <p className="news-headline">{article.headline}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NewsFeed;