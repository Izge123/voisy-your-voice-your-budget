-- Delete broken category where parent_id equals its own id
DELETE FROM categories WHERE parent_id = id;