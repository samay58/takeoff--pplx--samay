ALTER TABLE sources
ADD COLUMN author TEXT,
ADD COLUMN published_date TIMESTAMP,
ADD COLUMN publisher TEXT,
ADD COLUMN citation_style TEXT;
