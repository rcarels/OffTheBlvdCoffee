-- Optional starter content
-- Safe to run after 0001_initial_schema.sql

INSERT INTO site_about (
  heading,
  main_paragraph,
  story_paragraph,
  service_area_text
)
SELECT
  'Coffee, community, and flavor off the boulevard.',
  'Off The Blvd Coffee brings handcrafted drinks, warm service, and pop-up coffee experiences to the community.',
  'Built around great coffee, friendly service, and memorable gatherings.',
  'Available for local events, pop-ups, private bookings, and community celebrations.'
WHERE NOT EXISTS (
  SELECT 1 FROM site_about
);