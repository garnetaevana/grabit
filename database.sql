CREATE DATABASE IF NOT EXISTS armrobot;
USE armrobot;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

-- Tambah user contoh (password: admin123)
INSERT INTO users (username, password) VALUES (
  'admin',
  '$2y$10$dlb79v8aUK9yViLcnYMR1uRh7GIPG3iwz4MNFdpr7E1LgG12JDLkG'
);