-- Restore the eleven original storefront designs as managed published listings.
-- Every row below comes from the exact matched frame/dressed asset index already used by the prototype.
-- Image-size tokens are visual choices; checkout prices remain the shared size price list.
create temporary table legacy_bed_pairs (
  slug text, image_size text, finish text, frame_url text, dressed_url text, display_order integer
);
insert into legacy_bed_pairs values
  ('bunk-beds-design-01', 'twin-over-twin', 'matte-black', '/assets/bed-catalog-variants/bunk-beds/bunk-design-01-twin-over-twin-matte-black-frame.webp', '/assets/bed-catalog-variants/bunk-beds/bunk-design-01-twin-over-twin-matte-black-dressed.webp', 0),
  ('bunk-beds-design-02', 'twin-over-full', 'white', '/assets/bed-catalog-variants/bunk-beds/bunk-design-02-twin-over-full-white-frame.webp', '/assets/bed-catalog-variants/bunk-beds/bunk-design-02-twin-over-full-white-dressed.webp', 0),
  ('double-beds-design-01', 'standard', 'matte-black', '/assets/bed-catalog-variants/double-beds/double-design-01-standard-matte-black-frame.webp', '/assets/bed-catalog-variants/double-beds/double-design-01-standard-matte-black-dressed.webp', 0),
  ('double-beds-design-01', 'compact', 'antique-bronze', '/assets/bed-catalog-variants/double-beds/double-design-01-compact-antique-bronze-frame.webp', '/assets/bed-catalog-variants/double-beds/double-design-01-compact-antique-bronze-dressed.webp', 1),
  ('double-beds-design-01', 'compact', 'deep-navy', '/assets/bed-catalog-variants/double-beds/double-design-01-compact-deep-navy-frame.webp', '/assets/bed-catalog-variants/double-beds/double-design-01-compact-deep-navy-dressed.webp', 2),
  ('double-beds-design-01', 'compact', 'graphite-grey', '/assets/bed-catalog-variants/double-beds/double-design-01-compact-graphite-grey-frame.webp', '/assets/bed-catalog-variants/double-beds/double-design-01-compact-graphite-grey-dressed.webp', 3),
  ('double-beds-design-01', 'compact', 'matte-black', '/assets/bed-catalog-variants/double-beds/double-design-01-compact-matte-black-frame.webp', '/assets/bed-catalog-variants/double-beds/double-design-01-compact-matte-black-dressed.webp', 4),
  ('double-beds-design-01', 'compact', 'white', '/assets/bed-catalog-variants/double-beds/double-design-01-compact-white-frame.webp', '/assets/bed-catalog-variants/double-beds/double-design-01-compact-white-dressed.webp', 5),
  ('double-beds-design-01', 'standard', 'antique-bronze', '/assets/bed-catalog-variants/double-beds/double-design-01-standard-antique-bronze-frame.webp', '/assets/bed-catalog-variants/double-beds/double-design-01-standard-antique-bronze-dressed.webp', 6),
  ('double-beds-design-01', 'standard', 'deep-navy', '/assets/bed-catalog-variants/double-beds/double-design-01-standard-deep-navy-frame.webp', '/assets/bed-catalog-variants/double-beds/double-design-01-standard-deep-navy-dressed.webp', 7),
  ('double-beds-design-01', 'standard', 'graphite-grey', '/assets/bed-catalog-variants/double-beds/double-design-01-standard-graphite-grey-frame.webp', '/assets/bed-catalog-variants/double-beds/double-design-01-standard-graphite-grey-dressed.webp', 8),
  ('double-beds-design-01', 'standard', 'white', '/assets/bed-catalog-variants/double-beds/double-design-01-standard-white-frame.webp', '/assets/bed-catalog-variants/double-beds/double-design-01-standard-white-dressed.webp', 9),
  ('double-beds-design-01', 'wide', 'antique-bronze', '/assets/bed-catalog-variants/double-beds/double-design-01-wide-antique-bronze-frame.webp', '/assets/bed-catalog-variants/double-beds/double-design-01-wide-antique-bronze-dressed.webp', 10),
  ('double-beds-design-01', 'wide', 'deep-navy', '/assets/bed-catalog-variants/double-beds/double-design-01-wide-deep-navy-frame.webp', '/assets/bed-catalog-variants/double-beds/double-design-01-wide-deep-navy-dressed.webp', 11),
  ('double-beds-design-01', 'wide', 'graphite-grey', '/assets/bed-catalog-variants/double-beds/double-design-01-wide-graphite-grey-frame.webp', '/assets/bed-catalog-variants/double-beds/double-design-01-wide-graphite-grey-dressed.webp', 12),
  ('double-beds-design-01', 'wide', 'matte-black', '/assets/bed-catalog-variants/double-beds/double-design-01-wide-matte-black-frame.webp', '/assets/bed-catalog-variants/double-beds/double-design-01-wide-matte-black-dressed.webp', 13),
  ('double-beds-design-01', 'wide', 'white', '/assets/bed-catalog-variants/double-beds/double-design-01-wide-white-frame.webp', '/assets/bed-catalog-variants/double-beds/double-design-01-wide-white-dressed.webp', 14),
  ('double-beds-design-02', 'standard', 'matte-black', '/assets/bed-catalog-variants/double-beds/double-design-02-standard-matte-black-frame.webp', '/assets/bed-catalog-variants/double-beds/double-design-02-standard-matte-black-dressed.webp', 0),
  ('double-beds-design-02', 'compact', 'antique-bronze', '/assets/bed-catalog-variants/double-beds/double-design-02-compact-antique-bronze-frame.webp', '/assets/bed-catalog-variants/double-beds/double-design-02-compact-antique-bronze-dressed.webp', 1),
  ('double-beds-design-02', 'compact', 'deep-navy', '/assets/bed-catalog-variants/double-beds/double-design-02-compact-deep-navy-frame.webp', '/assets/bed-catalog-variants/double-beds/double-design-02-compact-deep-navy-dressed.webp', 2),
  ('double-beds-design-02', 'compact', 'graphite-grey', '/assets/bed-catalog-variants/double-beds/double-design-02-compact-graphite-grey-frame.webp', '/assets/bed-catalog-variants/double-beds/double-design-02-compact-graphite-grey-dressed.webp', 3),
  ('double-beds-design-02', 'compact', 'matte-black', '/assets/bed-catalog-variants/double-beds/double-design-02-compact-matte-black-frame.webp', '/assets/bed-catalog-variants/double-beds/double-design-02-compact-matte-black-dressed.webp', 4),
  ('double-beds-design-02', 'compact', 'white', '/assets/bed-catalog-variants/double-beds/double-design-02-compact-white-frame.webp', '/assets/bed-catalog-variants/double-beds/double-design-02-compact-white-dressed.webp', 5),
  ('double-beds-design-02', 'standard', 'antique-bronze', '/assets/bed-catalog-variants/double-beds/double-design-02-standard-antique-bronze-frame.webp', '/assets/bed-catalog-variants/double-beds/double-design-02-standard-antique-bronze-dressed.webp', 6),
  ('double-beds-design-02', 'standard', 'deep-navy', '/assets/bed-catalog-variants/double-beds/double-design-02-standard-deep-navy-frame.webp', '/assets/bed-catalog-variants/double-beds/double-design-02-standard-deep-navy-dressed.webp', 7),
  ('double-beds-design-02', 'standard', 'graphite-grey', '/assets/bed-catalog-variants/double-beds/double-design-02-standard-graphite-grey-frame.webp', '/assets/bed-catalog-variants/double-beds/double-design-02-standard-graphite-grey-dressed.webp', 8),
  ('double-beds-design-02', 'standard', 'white', '/assets/bed-catalog-variants/double-beds/double-design-02-standard-white-frame.webp', '/assets/bed-catalog-variants/double-beds/double-design-02-standard-white-dressed.webp', 9),
  ('double-beds-design-02', 'wide', 'antique-bronze', '/assets/bed-catalog-variants/double-beds/double-design-02-wide-antique-bronze-frame.webp', '/assets/bed-catalog-variants/double-beds/double-design-02-wide-antique-bronze-dressed.webp', 10),
  ('double-beds-design-02', 'wide', 'deep-navy', '/assets/bed-catalog-variants/double-beds/double-design-02-wide-deep-navy-frame.webp', '/assets/bed-catalog-variants/double-beds/double-design-02-wide-deep-navy-dressed.webp', 11),
  ('double-beds-design-02', 'wide', 'graphite-grey', '/assets/bed-catalog-variants/double-beds/double-design-02-wide-graphite-grey-frame.webp', '/assets/bed-catalog-variants/double-beds/double-design-02-wide-graphite-grey-dressed.webp', 12),
  ('double-beds-design-02', 'wide', 'matte-black', '/assets/bed-catalog-variants/double-beds/double-design-02-wide-matte-black-frame.webp', '/assets/bed-catalog-variants/double-beds/double-design-02-wide-matte-black-dressed.webp', 13),
  ('double-beds-design-02', 'wide', 'white', '/assets/bed-catalog-variants/double-beds/double-design-02-wide-white-frame.webp', '/assets/bed-catalog-variants/double-beds/double-design-02-wide-white-dressed.webp', 14),
  ('kids-beds-design-01', 'junior', 'matte-black', '/assets/bed-catalog-variants/kids-beds/kids-design-01-junior-matte-black-frame.webp', '/assets/bed-catalog-variants/kids-beds/kids-design-01-junior-matte-black-dressed.webp', 0),
  ('kids-beds-design-01', 'junior', 'antique-bronze', '/assets/bed-catalog-variants/kids-beds/kids-design-01-junior-antique-bronze-frame.webp', '/assets/bed-catalog-variants/kids-beds/kids-design-01-junior-antique-bronze-dressed.webp', 1),
  ('kids-beds-design-01', 'junior', 'deep-navy', '/assets/bed-catalog-variants/kids-beds/kids-design-01-junior-deep-navy-frame.webp', '/assets/bed-catalog-variants/kids-beds/kids-design-01-junior-deep-navy-dressed.webp', 2),
  ('kids-beds-design-01', 'junior', 'graphite-grey', '/assets/bed-catalog-variants/kids-beds/kids-design-01-junior-graphite-grey-frame.webp', '/assets/bed-catalog-variants/kids-beds/kids-design-01-junior-graphite-grey-dressed.webp', 3),
  ('king-beds-design-01', 'standard', 'matte-black', '/assets/bed-catalog-variants/king-beds/king-design-01-standard-matte-black-frame.webp', '/assets/bed-catalog-variants/king-beds/king-design-01-standard-matte-black-dressed.webp', 0),
  ('king-beds-design-01', 'grand', 'antique-bronze', '/assets/bed-catalog-variants/king-beds/king-design-01-grand-antique-bronze-frame.webp', '/assets/bed-catalog-variants/king-beds/king-design-01-grand-antique-bronze-dressed.webp', 1),
  ('king-beds-design-01', 'grand', 'deep-navy', '/assets/bed-catalog-variants/king-beds/king-design-01-grand-deep-navy-frame.webp', '/assets/bed-catalog-variants/king-beds/king-design-01-grand-deep-navy-dressed.webp', 2),
  ('king-beds-design-01', 'grand', 'graphite-grey', '/assets/bed-catalog-variants/king-beds/king-design-01-grand-graphite-grey-frame.webp', '/assets/bed-catalog-variants/king-beds/king-design-01-grand-graphite-grey-dressed.webp', 3),
  ('king-beds-design-01', 'grand', 'matte-black', '/assets/bed-catalog-variants/king-beds/king-design-01-grand-matte-black-frame.webp', '/assets/bed-catalog-variants/king-beds/king-design-01-grand-matte-black-dressed.webp', 4),
  ('king-beds-design-01', 'grand', 'white', '/assets/bed-catalog-variants/king-beds/king-design-01-grand-white-frame.webp', '/assets/bed-catalog-variants/king-beds/king-design-01-grand-white-dressed.webp', 5),
  ('king-beds-design-01', 'standard', 'antique-bronze', '/assets/bed-catalog-variants/king-beds/king-design-01-standard-antique-bronze-frame.webp', '/assets/bed-catalog-variants/king-beds/king-design-01-standard-antique-bronze-dressed.webp', 6),
  ('king-beds-design-01', 'standard', 'deep-navy', '/assets/bed-catalog-variants/king-beds/king-design-01-standard-deep-navy-frame.webp', '/assets/bed-catalog-variants/king-beds/king-design-01-standard-deep-navy-dressed.webp', 7),
  ('king-beds-design-01', 'standard', 'graphite-grey', '/assets/bed-catalog-variants/king-beds/king-design-01-standard-graphite-grey-frame.webp', '/assets/bed-catalog-variants/king-beds/king-design-01-standard-graphite-grey-dressed.webp', 8),
  ('king-beds-design-01', 'standard', 'white', '/assets/bed-catalog-variants/king-beds/king-design-01-standard-white-frame.webp', '/assets/bed-catalog-variants/king-beds/king-design-01-standard-white-dressed.webp', 9),
  ('king-beds-design-01', 'super-king', 'antique-bronze', '/assets/bed-catalog-variants/king-beds/king-design-01-super-king-antique-bronze-frame.webp', '/assets/bed-catalog-variants/king-beds/king-design-01-super-king-antique-bronze-dressed.webp', 10),
  ('king-beds-design-01', 'super-king', 'deep-navy', '/assets/bed-catalog-variants/king-beds/king-design-01-super-king-deep-navy-frame.webp', '/assets/bed-catalog-variants/king-beds/king-design-01-super-king-deep-navy-dressed.webp', 11),
  ('king-beds-design-01', 'super-king', 'graphite-grey', '/assets/bed-catalog-variants/king-beds/king-design-01-super-king-graphite-grey-frame.webp', '/assets/bed-catalog-variants/king-beds/king-design-01-super-king-graphite-grey-dressed.webp', 12),
  ('king-beds-design-01', 'super-king', 'matte-black', '/assets/bed-catalog-variants/king-beds/king-design-01-super-king-matte-black-frame.webp', '/assets/bed-catalog-variants/king-beds/king-design-01-super-king-matte-black-dressed.webp', 13),
  ('king-beds-design-01', 'super-king', 'white', '/assets/bed-catalog-variants/king-beds/king-design-01-super-king-white-frame.webp', '/assets/bed-catalog-variants/king-beds/king-design-01-super-king-white-dressed.webp', 14),
  ('king-beds-design-02', 'standard', 'matte-black', '/assets/bed-catalog-variants/king-beds/king-design-02-standard-matte-black-frame.webp', '/assets/bed-catalog-variants/king-beds/king-design-02-standard-matte-black-dressed.webp', 0),
  ('king-beds-design-02', 'grand', 'antique-bronze', '/assets/bed-catalog-variants/king-beds/king-design-02-grand-antique-bronze-frame.webp', '/assets/bed-catalog-variants/king-beds/king-design-02-grand-antique-bronze-dressed.webp', 1),
  ('king-beds-design-02', 'grand', 'deep-navy', '/assets/bed-catalog-variants/king-beds/king-design-02-grand-deep-navy-frame.webp', '/assets/bed-catalog-variants/king-beds/king-design-02-grand-deep-navy-dressed.webp', 2),
  ('king-beds-design-02', 'grand', 'graphite-grey', '/assets/bed-catalog-variants/king-beds/king-design-02-grand-graphite-grey-frame.webp', '/assets/bed-catalog-variants/king-beds/king-design-02-grand-graphite-grey-dressed.webp', 3),
  ('king-beds-design-02', 'grand', 'matte-black', '/assets/bed-catalog-variants/king-beds/king-design-02-grand-matte-black-frame.webp', '/assets/bed-catalog-variants/king-beds/king-design-02-grand-matte-black-dressed.webp', 4),
  ('king-beds-design-02', 'grand', 'white', '/assets/bed-catalog-variants/king-beds/king-design-02-grand-white-frame.webp', '/assets/bed-catalog-variants/king-beds/king-design-02-grand-white-dressed.webp', 5),
  ('king-beds-design-02', 'standard', 'antique-bronze', '/assets/bed-catalog-variants/king-beds/king-design-02-standard-antique-bronze-frame.webp', '/assets/bed-catalog-variants/king-beds/king-design-02-standard-antique-bronze-dressed.webp', 6),
  ('king-beds-design-02', 'standard', 'deep-navy', '/assets/bed-catalog-variants/king-beds/king-design-02-standard-deep-navy-frame.webp', '/assets/bed-catalog-variants/king-beds/king-design-02-standard-deep-navy-dressed.webp', 7),
  ('king-beds-design-02', 'standard', 'graphite-grey', '/assets/bed-catalog-variants/king-beds/king-design-02-standard-graphite-grey-frame.webp', '/assets/bed-catalog-variants/king-beds/king-design-02-standard-graphite-grey-dressed.webp', 8),
  ('king-beds-design-02', 'standard', 'white', '/assets/bed-catalog-variants/king-beds/king-design-02-standard-white-frame.webp', '/assets/bed-catalog-variants/king-beds/king-design-02-standard-white-dressed.webp', 9),
  ('king-beds-design-02', 'super-king', 'antique-bronze', '/assets/bed-catalog-variants/king-beds/king-design-02-super-king-antique-bronze-frame.webp', '/assets/bed-catalog-variants/king-beds/king-design-02-super-king-antique-bronze-dressed.webp', 10),
  ('king-beds-design-02', 'super-king', 'deep-navy', '/assets/bed-catalog-variants/king-beds/king-design-02-super-king-deep-navy-frame.webp', '/assets/bed-catalog-variants/king-beds/king-design-02-super-king-deep-navy-dressed.webp', 11),
  ('king-beds-design-02', 'super-king', 'graphite-grey', '/assets/bed-catalog-variants/king-beds/king-design-02-super-king-graphite-grey-frame.webp', '/assets/bed-catalog-variants/king-beds/king-design-02-super-king-graphite-grey-dressed.webp', 12),
  ('king-beds-design-02', 'super-king', 'matte-black', '/assets/bed-catalog-variants/king-beds/king-design-02-super-king-matte-black-frame.webp', '/assets/bed-catalog-variants/king-beds/king-design-02-super-king-matte-black-dressed.webp', 13),
  ('king-beds-design-02', 'super-king', 'white', '/assets/bed-catalog-variants/king-beds/king-design-02-super-king-white-frame.webp', '/assets/bed-catalog-variants/king-beds/king-design-02-super-king-white-dressed.webp', 14),
  ('queen-beds-design-01', 'standard', 'matte-black', '/assets/bed-catalog-variants/queen-beds/queen-design-01-standard-matte-black-frame.webp', '/assets/bed-catalog-variants/queen-beds/queen-design-01-standard-matte-black-dressed.webp', 0),
  ('queen-beds-design-01', 'compact', 'antique-bronze', '/assets/bed-catalog-variants/queen-beds/queen-design-01-compact-antique-bronze-frame.webp', '/assets/bed-catalog-variants/queen-beds/queen-design-01-compact-antique-bronze-dressed.webp', 1),
  ('queen-beds-design-01', 'compact', 'deep-navy', '/assets/bed-catalog-variants/queen-beds/queen-design-01-compact-deep-navy-frame.webp', '/assets/bed-catalog-variants/queen-beds/queen-design-01-compact-deep-navy-dressed.webp', 2),
  ('queen-beds-design-01', 'compact', 'graphite-grey', '/assets/bed-catalog-variants/queen-beds/queen-design-01-compact-graphite-grey-frame.webp', '/assets/bed-catalog-variants/queen-beds/queen-design-01-compact-graphite-grey-dressed.webp', 3),
  ('queen-beds-design-01', 'compact', 'matte-black', '/assets/bed-catalog-variants/queen-beds/queen-design-01-compact-matte-black-frame.webp', '/assets/bed-catalog-variants/queen-beds/queen-design-01-compact-matte-black-dressed.webp', 4),
  ('queen-beds-design-01', 'compact', 'white', '/assets/bed-catalog-variants/queen-beds/queen-design-01-compact-white-frame.webp', '/assets/bed-catalog-variants/queen-beds/queen-design-01-compact-white-dressed.webp', 5),
  ('queen-beds-design-01', 'standard', 'antique-bronze', '/assets/bed-catalog-variants/queen-beds/queen-design-01-standard-antique-bronze-frame.webp', '/assets/bed-catalog-variants/queen-beds/queen-design-01-standard-antique-bronze-dressed.webp', 6),
  ('queen-beds-design-01', 'standard', 'deep-navy', '/assets/bed-catalog-variants/queen-beds/queen-design-01-standard-deep-navy-frame.webp', '/assets/bed-catalog-variants/queen-beds/queen-design-01-standard-deep-navy-dressed.webp', 7),
  ('queen-beds-design-01', 'standard', 'graphite-grey', '/assets/bed-catalog-variants/queen-beds/queen-design-01-standard-graphite-grey-frame.webp', '/assets/bed-catalog-variants/queen-beds/queen-design-01-standard-graphite-grey-dressed.webp', 8),
  ('queen-beds-design-01', 'standard', 'white', '/assets/bed-catalog-variants/queen-beds/queen-design-01-standard-white-frame.webp', '/assets/bed-catalog-variants/queen-beds/queen-design-01-standard-white-dressed.webp', 9),
  ('queen-beds-design-01', 'wide', 'antique-bronze', '/assets/bed-catalog-variants/queen-beds/queen-design-01-wide-antique-bronze-frame.webp', '/assets/bed-catalog-variants/queen-beds/queen-design-01-wide-antique-bronze-dressed.webp', 10),
  ('queen-beds-design-01', 'wide', 'deep-navy', '/assets/bed-catalog-variants/queen-beds/queen-design-01-wide-deep-navy-frame.webp', '/assets/bed-catalog-variants/queen-beds/queen-design-01-wide-deep-navy-dressed.webp', 11),
  ('queen-beds-design-01', 'wide', 'graphite-grey', '/assets/bed-catalog-variants/queen-beds/queen-design-01-wide-graphite-grey-frame.webp', '/assets/bed-catalog-variants/queen-beds/queen-design-01-wide-graphite-grey-dressed.webp', 12),
  ('queen-beds-design-01', 'wide', 'matte-black', '/assets/bed-catalog-variants/queen-beds/queen-design-01-wide-matte-black-frame.webp', '/assets/bed-catalog-variants/queen-beds/queen-design-01-wide-matte-black-dressed.webp', 13),
  ('queen-beds-design-01', 'wide', 'white', '/assets/bed-catalog-variants/queen-beds/queen-design-01-wide-white-frame.webp', '/assets/bed-catalog-variants/queen-beds/queen-design-01-wide-white-dressed.webp', 14),
  ('queen-beds-design-02', 'standard', 'matte-black', '/assets/bed-catalog-variants/queen-beds/queen-design-02-standard-matte-black-frame.webp', '/assets/bed-catalog-variants/queen-beds/queen-design-02-standard-matte-black-dressed.webp', 0),
  ('queen-beds-design-02', 'compact', 'antique-bronze', '/assets/bed-catalog-variants/queen-beds/queen-design-02-compact-antique-bronze-frame.webp', '/assets/bed-catalog-variants/queen-beds/queen-design-02-compact-antique-bronze-dressed.webp', 1),
  ('queen-beds-design-02', 'compact', 'deep-navy', '/assets/bed-catalog-variants/queen-beds/queen-design-02-compact-deep-navy-frame.webp', '/assets/bed-catalog-variants/queen-beds/queen-design-02-compact-deep-navy-dressed.webp', 2),
  ('queen-beds-design-02', 'compact', 'graphite-grey', '/assets/bed-catalog-variants/queen-beds/queen-design-02-compact-graphite-grey-frame.webp', '/assets/bed-catalog-variants/queen-beds/queen-design-02-compact-graphite-grey-dressed.webp', 3),
  ('queen-beds-design-02', 'compact', 'matte-black', '/assets/bed-catalog-variants/queen-beds/queen-design-02-compact-matte-black-frame.webp', '/assets/bed-catalog-variants/queen-beds/queen-design-02-compact-matte-black-dressed.webp', 4),
  ('queen-beds-design-02', 'compact', 'white', '/assets/bed-catalog-variants/queen-beds/queen-design-02-compact-white-frame.webp', '/assets/bed-catalog-variants/queen-beds/queen-design-02-compact-white-dressed.webp', 5),
  ('queen-beds-design-02', 'standard', 'antique-bronze', '/assets/bed-catalog-variants/queen-beds/queen-design-02-standard-antique-bronze-frame.webp', '/assets/bed-catalog-variants/queen-beds/queen-design-02-standard-antique-bronze-dressed.webp', 6),
  ('queen-beds-design-02', 'standard', 'deep-navy', '/assets/bed-catalog-variants/queen-beds/queen-design-02-standard-deep-navy-frame.webp', '/assets/bed-catalog-variants/queen-beds/queen-design-02-standard-deep-navy-dressed.webp', 7),
  ('queen-beds-design-02', 'standard', 'graphite-grey', '/assets/bed-catalog-variants/queen-beds/queen-design-02-standard-graphite-grey-frame.webp', '/assets/bed-catalog-variants/queen-beds/queen-design-02-standard-graphite-grey-dressed.webp', 8),
  ('queen-beds-design-02', 'standard', 'white', '/assets/bed-catalog-variants/queen-beds/queen-design-02-standard-white-frame.webp', '/assets/bed-catalog-variants/queen-beds/queen-design-02-standard-white-dressed.webp', 9),
  ('queen-beds-design-02', 'wide', 'antique-bronze', '/assets/bed-catalog-variants/queen-beds/queen-design-02-wide-antique-bronze-frame.webp', '/assets/bed-catalog-variants/queen-beds/queen-design-02-wide-antique-bronze-dressed.webp', 10),
  ('queen-beds-design-02', 'wide', 'deep-navy', '/assets/bed-catalog-variants/queen-beds/queen-design-02-wide-deep-navy-frame.webp', '/assets/bed-catalog-variants/queen-beds/queen-design-02-wide-deep-navy-dressed.webp', 11),
  ('queen-beds-design-02', 'wide', 'graphite-grey', '/assets/bed-catalog-variants/queen-beds/queen-design-02-wide-graphite-grey-frame.webp', '/assets/bed-catalog-variants/queen-beds/queen-design-02-wide-graphite-grey-dressed.webp', 12),
  ('queen-beds-design-02', 'wide', 'matte-black', '/assets/bed-catalog-variants/queen-beds/queen-design-02-wide-matte-black-frame.webp', '/assets/bed-catalog-variants/queen-beds/queen-design-02-wide-matte-black-dressed.webp', 13),
  ('queen-beds-design-02', 'wide', 'white', '/assets/bed-catalog-variants/queen-beds/queen-design-02-wide-white-frame.webp', '/assets/bed-catalog-variants/queen-beds/queen-design-02-wide-white-dressed.webp', 14),
  ('triple-beds-design-01', 'narrow', 'matte-black', '/assets/bed-catalog-variants/triple-beds/triple-design-01-narrow-matte-black-frame.webp', '/assets/bed-catalog-variants/triple-beds/triple-design-01-narrow-matte-black-dressed.webp', 0),
  ('triple-beds-design-01', 'narrow', 'antique-bronze', '/assets/bed-catalog-variants/triple-beds/triple-design-01-narrow-antique-bronze-frame.webp', '/assets/bed-catalog-variants/triple-beds/triple-design-01-narrow-antique-bronze-dressed.webp', 1),
  ('triple-beds-design-01', 'narrow', 'deep-navy', '/assets/bed-catalog-variants/triple-beds/triple-design-01-narrow-deep-navy-frame.webp', '/assets/bed-catalog-variants/triple-beds/triple-design-01-narrow-deep-navy-dressed.webp', 2),
  ('triple-beds-design-01', 'narrow', 'graphite-grey', '/assets/bed-catalog-variants/triple-beds/triple-design-01-narrow-graphite-grey-frame.webp', '/assets/bed-catalog-variants/triple-beds/triple-design-01-narrow-graphite-grey-dressed.webp', 3),
  ('triple-beds-design-01', 'narrow', 'white', '/assets/bed-catalog-variants/triple-beds/triple-design-01-narrow-white-frame.webp', '/assets/bed-catalog-variants/triple-beds/triple-design-01-narrow-white-dressed.webp', 4),
  ('triple-beds-design-01', 'three-tier', 'antique-bronze', '/assets/bed-catalog-variants/triple-beds/triple-design-01-three-tier-antique-bronze-frame.webp', '/assets/bed-catalog-variants/triple-beds/triple-design-01-three-tier-antique-bronze-dressed.webp', 5),
  ('triple-beds-design-01', 'three-tier', 'deep-navy', '/assets/bed-catalog-variants/triple-beds/triple-design-01-three-tier-deep-navy-frame.webp', '/assets/bed-catalog-variants/triple-beds/triple-design-01-three-tier-deep-navy-dressed.webp', 6),
  ('triple-beds-design-01', 'three-tier', 'graphite-grey', '/assets/bed-catalog-variants/triple-beds/triple-design-01-three-tier-graphite-grey-frame.webp', '/assets/bed-catalog-variants/triple-beds/triple-design-01-three-tier-graphite-grey-dressed.webp', 7),
  ('triple-beds-design-01', 'three-tier', 'matte-black', '/assets/bed-catalog-variants/triple-beds/triple-design-01-three-tier-matte-black-frame.webp', '/assets/bed-catalog-variants/triple-beds/triple-design-01-three-tier-matte-black-dressed.webp', 8),
  ('triple-beds-design-01', 'three-tier', 'white', '/assets/bed-catalog-variants/triple-beds/triple-design-01-three-tier-white-frame.webp', '/assets/bed-catalog-variants/triple-beds/triple-design-01-three-tier-white-dressed.webp', 9),
  ('triple-beds-design-01', 'wide', 'antique-bronze', '/assets/bed-catalog-variants/triple-beds/triple-design-01-wide-antique-bronze-frame.webp', '/assets/bed-catalog-variants/triple-beds/triple-design-01-wide-antique-bronze-dressed.webp', 10),
  ('triple-beds-design-01', 'wide', 'deep-navy', '/assets/bed-catalog-variants/triple-beds/triple-design-01-wide-deep-navy-frame.webp', '/assets/bed-catalog-variants/triple-beds/triple-design-01-wide-deep-navy-dressed.webp', 11),
  ('triple-beds-design-01', 'wide', 'graphite-grey', '/assets/bed-catalog-variants/triple-beds/triple-design-01-wide-graphite-grey-frame.webp', '/assets/bed-catalog-variants/triple-beds/triple-design-01-wide-graphite-grey-dressed.webp', 12),
  ('triple-beds-design-01', 'wide', 'matte-black', '/assets/bed-catalog-variants/triple-beds/triple-design-01-wide-matte-black-frame.webp', '/assets/bed-catalog-variants/triple-beds/triple-design-01-wide-matte-black-dressed.webp', 13),
  ('triple-beds-design-01', 'wide', 'white', '/assets/bed-catalog-variants/triple-beds/triple-design-01-wide-white-frame.webp', '/assets/bed-catalog-variants/triple-beds/triple-design-01-wide-white-dressed.webp', 14),
  ('triple-beds-design-02', 'narrow', 'matte-black', '/assets/bed-catalog-variants/triple-beds/triple-design-02-narrow-matte-black-frame.webp', '/assets/bed-catalog-variants/triple-beds/triple-design-02-narrow-matte-black-dressed.webp', 0),
  ('triple-beds-design-02', 'narrow', 'antique-bronze', '/assets/bed-catalog-variants/triple-beds/triple-design-02-narrow-antique-bronze-frame.webp', '/assets/bed-catalog-variants/triple-beds/triple-design-02-narrow-antique-bronze-dressed.webp', 1),
  ('triple-beds-design-02', 'narrow', 'deep-navy', '/assets/bed-catalog-variants/triple-beds/triple-design-02-narrow-deep-navy-frame.webp', '/assets/bed-catalog-variants/triple-beds/triple-design-02-narrow-deep-navy-dressed.webp', 2),
  ('triple-beds-design-02', 'narrow', 'graphite-grey', '/assets/bed-catalog-variants/triple-beds/triple-design-02-narrow-graphite-grey-frame.webp', '/assets/bed-catalog-variants/triple-beds/triple-design-02-narrow-graphite-grey-dressed.webp', 3),
  ('triple-beds-design-02', 'narrow', 'white', '/assets/bed-catalog-variants/triple-beds/triple-design-02-narrow-white-frame.webp', '/assets/bed-catalog-variants/triple-beds/triple-design-02-narrow-white-dressed.webp', 4),
  ('triple-beds-design-02', 'three-tier', 'antique-bronze', '/assets/bed-catalog-variants/triple-beds/triple-design-02-three-tier-antique-bronze-frame.webp', '/assets/bed-catalog-variants/triple-beds/triple-design-02-three-tier-antique-bronze-dressed.webp', 5),
  ('triple-beds-design-02', 'three-tier', 'deep-navy', '/assets/bed-catalog-variants/triple-beds/triple-design-02-three-tier-deep-navy-frame.webp', '/assets/bed-catalog-variants/triple-beds/triple-design-02-three-tier-deep-navy-dressed.webp', 6),
  ('triple-beds-design-02', 'three-tier', 'graphite-grey', '/assets/bed-catalog-variants/triple-beds/triple-design-02-three-tier-graphite-grey-frame.webp', '/assets/bed-catalog-variants/triple-beds/triple-design-02-three-tier-graphite-grey-dressed.webp', 7),
  ('triple-beds-design-02', 'three-tier', 'matte-black', '/assets/bed-catalog-variants/triple-beds/triple-design-02-three-tier-matte-black-frame.webp', '/assets/bed-catalog-variants/triple-beds/triple-design-02-three-tier-matte-black-dressed.webp', 8),
  ('triple-beds-design-02', 'three-tier', 'white', '/assets/bed-catalog-variants/triple-beds/triple-design-02-three-tier-white-frame.webp', '/assets/bed-catalog-variants/triple-beds/triple-design-02-three-tier-white-dressed.webp', 9),
  ('triple-beds-design-02', 'wide', 'antique-bronze', '/assets/bed-catalog-variants/triple-beds/triple-design-02-wide-antique-bronze-frame.webp', '/assets/bed-catalog-variants/triple-beds/triple-design-02-wide-antique-bronze-dressed.webp', 10),
  ('triple-beds-design-02', 'wide', 'deep-navy', '/assets/bed-catalog-variants/triple-beds/triple-design-02-wide-deep-navy-frame.webp', '/assets/bed-catalog-variants/triple-beds/triple-design-02-wide-deep-navy-dressed.webp', 11),
  ('triple-beds-design-02', 'wide', 'graphite-grey', '/assets/bed-catalog-variants/triple-beds/triple-design-02-wide-graphite-grey-frame.webp', '/assets/bed-catalog-variants/triple-beds/triple-design-02-wide-graphite-grey-dressed.webp', 12),
  ('triple-beds-design-02', 'wide', 'matte-black', '/assets/bed-catalog-variants/triple-beds/triple-design-02-wide-matte-black-frame.webp', '/assets/bed-catalog-variants/triple-beds/triple-design-02-wide-matte-black-dressed.webp', 13),
  ('triple-beds-design-02', 'wide', 'white', '/assets/bed-catalog-variants/triple-beds/triple-design-02-wide-white-frame.webp', '/assets/bed-catalog-variants/triple-beds/triple-design-02-wide-white-dressed.webp', 14);

do $$ begin
  if (select count(*) from legacy_bed_pairs) <> 126
    or (select count(distinct slug) from legacy_bed_pairs) <> 11
    or (select count(*) from public.products where slug in ('bunk-beds-design-01', 'bunk-beds-design-02', 'double-beds-design-01', 'double-beds-design-02', 'kids-beds-design-01', 'king-beds-design-01', 'king-beds-design-02', 'queen-beds-design-01', 'queen-beds-design-02', 'triple-beds-design-01', 'triple-beds-design-02')) <> 11
    or (select count(*) from legacy_bed_pairs s join public.product_images i on i.image_url = s.dressed_url and i.is_primary join public.products p on p.id = i.product_id and p.slug = s.slug where s.display_order = 0) <> 11
  then raise exception 'Original catalogue does not match the verified 11 designs and 126 image pairs';
  end if;
end $$;

insert into public.variants (product_id, design, size, colour, sku, price_ugx, is_active, created_at)
select p.id, p.name, s.image_size,
  initcap(replace(s.finish, '-', ' ')),
  'HF-LEGACY-' || s.slug || '-' || s.image_size || '-' || s.finish,
  (select (sizes->0->>'price')::bigint from public.catalogue_options where id = 1),
  true, now() + s.display_order * interval '1 microsecond'
from legacy_bed_pairs s join public.products p on p.slug = s.slug
on conflict (product_id, design, size, colour) do nothing;

insert into public.configurator_assets (variant_id, view, storage_path, image_url, alt_text, match_confirmed, is_active)
select v.id, a.view,
  'bundled/' || s.slug || '/' || s.image_size || '-' || s.finish || '-' || a.view || '.webp',
  a.url, p.name || ' ' || s.image_size || ' ' || replace(s.finish, '-', ' ') || ' ' || a.view || ' preview',
  true, true
from legacy_bed_pairs s join public.products p on p.slug = s.slug
join public.variants v on v.product_id = p.id and v.design = p.name and v.size = s.image_size and v.colour = initcap(replace(s.finish, '-', ' '))
cross join lateral (values ('frame', s.frame_url), ('dressed', s.dressed_url)) as a(view, url)
on conflict (variant_id, view) do nothing;

update public.products p set status = 'published'
where p.slug in ('bunk-beds-design-01', 'bunk-beds-design-02', 'double-beds-design-01', 'double-beds-design-02', 'kids-beds-design-01', 'king-beds-design-01', 'king-beds-design-02', 'queen-beds-design-01', 'queen-beds-design-02', 'triple-beds-design-01', 'triple-beds-design-02') and p.status = 'draft';

do $$ begin
  if (select count(*) from public.products where slug in ('bunk-beds-design-01', 'bunk-beds-design-02', 'double-beds-design-01', 'double-beds-design-02', 'kids-beds-design-01', 'king-beds-design-01', 'king-beds-design-02', 'queen-beds-design-01', 'queen-beds-design-02', 'triple-beds-design-01', 'triple-beds-design-02') and status = 'published') <> 11
  then raise exception 'Not all eleven original beds were published';
  end if;
end $$;
