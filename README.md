# Share a Meal

[![Deploy to Heroku](https://github.com/martijnschermers/share-a-meal/actions/workflows/main.yml/badge.svg)](https://github.com/martijnschermers/share-a-meal/actions/workflows/main.yml)

This repository contains the source code of the share-a-meal backend server. 
The application is written with Node/Express.

## Description

This application provides a Node server that serves various endpoints.
It is written based on the REST architecture. It is possible to add meals and users and retrieve the added meals and users. 
All the other CRUD operations are possible as well, such as updating a user for example.

## Run Locally

Clone the project

```bash
  git clone https://github.com/martijnschermers/share-a-meal.git
```

Go to the project directory

```bash
  cd share-a-meal
```

Install dependencies

```bash
  npm install
```

Create a local database
```bash
  cd share-a-meal
  mysql -u root
```

```sql
  CREATE DATABASE share_a_meal;
  USE share_a_meal;
  SOURCE database.sql;
```

Start the database with [XAMPP](https://www.apachefriends.org/index.html)

Start the server

```bash
  npm run dev
```

## Running Tests

To run tests, run the following command

```bash
  npm run test
```

## Tech Stack

**Server:** Node, Express, MySQL

## Authors

- [@martijnschermers | 2184875](https://www.github.com/martijnschermers)
