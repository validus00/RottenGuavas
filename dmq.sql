
-- 1. Index - without filters
--		Load Consoles sidebar
SELECT console_ID, console_name FROM Consoles ORDER BY console_ID;
--		Load Genres sidebar
SELECT genre_ID, genre_name FROM Genres
ORDER BY genre_name ASC;
--		Show top games tables is done through finding console_names that has games with reviews
SELECT console_name FROM Consoles JOIN Reviews
ON Consoles.console_ID = Reviews.console_ID GROUP BY console_name;
--		then show games of consoles through a for-loop on console_name
SELECT Games.game_ID, game_name, AVG(rating) AS rating FROM Reviews
JOIN Games ON Reviews.game_ID = Games.game_ID JOIN Consoles ON Reviews.console_ID = Consoles.console_ID
WHERE console_name = ? GROUP BY game_name ORDER BY rating DESC;
--		Load all games tables is done through a for-loop on console_name
SELECT Games.game_ID, game_name, AVG(rating) AS rating FROM Games
JOIN Consoles_Games ON Games.game_ID = Consoles_Games.game_ID
JOIN Consoles ON Consoles_Games.console_ID = Consoles.console_ID
LEFT JOIN Reviews ON Consoles.console_ID = Reviews.console_ID AND Games.game_ID = Reviews.game_ID
WHERE console_name = :console_name GROUP BY game_name ORDER BY rating DESC; -- where :console_name = PS4, Switch,...

-- 2. Index filtered by game name in search bar, for example if type in "Yakuza 0"
--		Get all console_name pertaining to the game "Yakuza 0"
SELECT console_name FROM Consoles
JOIN Consoles_Games ON Consoles.console_ID = Consoles_Games.console_ID
JOIN Games ON Consoles_Games.game_ID = Games.game_ID
WHERE game_name LIKE "%Yakuza 0%" GROUP BY console_name;
-- then for each entry, make query for that game. For example, for console_name = PS4, do:
SELECT Games.game_ID, game_name, AVG(rating) AS rating FROM Games
JOIN Consoles_Games ON Games.game_ID = Consoles_Games.game_ID
JOIN Consoles ON Consoles_Games.console_ID = Consoles.console_ID
LEFT JOIN Reviews ON Consoles.console_ID = Reviews.console_ID AND Games.game_ID = Reviews.game_ID
WHERE console_name = "PS4" AND game_name LIKE "%Yakuza 0%" GROUP BY game_name ORDER BY rating DESC;
-- for console_ID = Switch, do:
SELECT Games.game_ID, game_name, AVG(rating) AS rating FROM Games
JOIN Consoles_Games ON Games.game_ID = Consoles_Games.game_ID
JOIN Consoles ON Consoles_Games.console_ID = Consoles.console_ID
LEFT JOIN Reviews ON Consoles.console_ID = Reviews.console_ID AND Games.game_ID = Reviews.game_ID
WHERE console_name = "Switch" AND game_name LIKE "%Yakuza 0%" GROUP BY game_name ORDER BY rating DESC;
-- this will be done using a for-loop

-- 3. Index filtered by Consoles in sidebar
--		Depending on submitted form and which console_name are selected
--		Loading all games tables is done through a for-loop on console_name
SELECT Games.game_ID, game_name, AVG(rating) AS rating FROM Games
JOIN Consoles_Games ON Games.game_ID = Consoles_Games.game_ID
JOIN Consoles ON Consoles_Games.console_ID = Consoles.console_ID
LEFT JOIN Reviews ON Consoles.console_ID = Reviews.console_ID AND Games.game_ID = Reviews.game_ID
WHERE console_name = :console_name		-- where :console_name = PS4, Switch,...
GROUP BY game_name ORDER BY rating DESC;

-- 4. Index filtered by Genres in sidebar
--		Depending on submitted form and which genre_IDs are selected
--		Get console_name with games that have genre_IDs
SELECT console_name FROM Consoles JOIN Consoles_Games
ON Consoles.console_ID = Consoles_Games.console_ID JOIN Games ON Consoles_Games.game_ID = Games.game_ID
JOIN Genres_Games ON Games.game_ID = Genres_Games.game_ID
WHERE (genre_ID = :genre_ID OR genre_ID = :genre_ID) GROUP BY console_name ORDER BY console_ID;
--		Loading all games tables is done through a for-loop on console_name and genre_ID combinations
SELECT Games.game_ID, game_name, AVG(rating) AS rating FROM Games
JOIN Consoles_Games ON Games.game_ID = Consoles_Games.game_ID
JOIN Consoles ON Consoles_Games.console_ID = Consoles.console_ID
LEFT JOIN Reviews ON Consoles.console_ID = Reviews.console_ID AND Games.game_ID = Reviews.game_ID
JOIN Genres_Games ON Games.game_ID = Genres_Games.game_ID WHERE console_name = :console_name AND (genre_ID = :genre_ID OR genre_ID = :genre_ID)
GROUP BY game_name ORDER BY rating DESC;

-- 5. Index - inserting to Consoles
--		Check if console name exists
SELECT * FROM Consoles WHERE console_name = :console_name;
--		If not exist, then insert
INSERT INTO Consoles (console_name) VALUES (:console_name);	-- where :console_name = varchar

-- 6. Index - insert to Genres
SELECT * FROM Genres WHERE genre_name = :genre_name;
--		If not exist, then insert
INSERT INTO Genres (genre_name) VALUES (:genre_name); -- where :genre_name = varchar

-- 7. Sign Up - insert to Users
SELECT * FROM Users WHERE user_name = :user_name; -- where :user_name = varchar from User
--		If not exist, then insert
INSERT INTO Users (user_name, password, email, pref_console_ID, photo) VALUES (:user_name, :password, :email, :pref_console_ID, :photo);
-- where :user_name = varchar, :password = varchar, :email = varchar, :pref_console_ID = optional int of console_ID, :photo = optional blob

-- 8. Login - select to Users
SELECT * FROM Users WHERE user_name = :user_name AND password = :password; -- where :user_name = varchar from user, :password = varchar from user
-- store user_ID into session

-- 9. Add game - insert to Games, Consoles_Games
--		Display Consoles and Genres
SELECT console_ID, console_name FROM Consoles;
SELECT genre_ID, genre_name FROM Genres
ORDER BY genre_name ASC;

--		Check if game exists
SELECT game_name FROM Games WHERE game_name = :game_name; -- where :game_name = varchar from user
-- if query returns empty, then INSERT
INSERT INTO Games (game_name, release_date, description, photo) VALUES (:game_name, :release_date, :description, :photo);
-- get game_ID
SELECT game_ID FROM Games WHERE game_name = :game_name;
-- insert into composite entity tables
INSERT INTO Consoles_Games(console_ID, game_ID) VALUES (:console_ID, :game_ID);	-- generates this query for every console that the User selects
INSERT INTO Genres_Games(genre_ID, game_ID) VALUES (:genre_ID, :game_ID);	-- generates this query for every genre that the User selects

-- if query returns some results, then
-- do Consoles first
SELECT console_name FROM Consoles_Games
JOIN Consoles ON Consoles_Games.console_ID = Consoles.console_ID
WHERE Consoles_Games.console_ID = :console_ID AND game_ID = :game_ID;
-- this generates a consoles_list
INSERT INTO Consoles_Games(console_ID, game_ID) VALUES (:console_ID, :game_ID);	-- generates this query for every console that the User selects that is NOT in consoles_list
-- If no consoles are found, still get name to put in alert
SELECT console_name FROM Consoles where console_ID = :console_ID;

-- do Genres second
SELECT genre_name FROM Genres_Games
JOIN Genres ON Genres_Games.genre_ID = Genres.genre_ID
WHERE Genres_Games.genre_ID = :genre_ID AND game_ID = :game_ID;
-- this generates a genres_list
INSERT INTO Genres_Games(genre_ID, game_ID) VALUES (:genre_ID, :game_ID);	-- generates this query for every genre that the User selects that is NOT in genres_list
-- If no genres are found, still get name to put in alert
SELECT genre_name FROM Genres where genre_ID = :genre_ID;

-- 10. Profile page
--		Display user info
SELECT * FROM Users WHERE user_ID = :user_ID; -- where :user_name is from Express session var user_ID
--		Get consoles for profile console preference
SELECT console_ID, console_name FROM Consoles ORDER BY console_ID;
--		Display user reviews
SELECT review_ID, game_name, console_name, rating, review_date, title, content FROM Reviews
JOIN Games ON Reviews.game_ID = Games.game_ID
JOIN Consoles ON Reviews.console_ID = Consoles.console_ID
WHERE user_ID = :user_ID; -- where :user_ID is from Express session var user_ID
--		Delete review
DELETE FROM Reviews WHERE review_ID = :review_ID AND user_ID = :user_ID; -- where :review_ID = int from user selection and :user_ID stored in session
--		Update user Profile
--		Check if user_name is already used
SELECT * FROM Users WHERE user_name = :user_name AND user_ID != :user_ID; -- where :user_name = varchar from user and :user_ID stored in session
--		if no results then
UPDATE Users SET user_name = :user_name, password = :password, email = :email, pref_console_ID = :pref_console_ID, photo = :photo
WHERE user_ID = :user_ID;
-- where :user_name = varchar from User, :password = varchar from User, :email = varchar from User, :pref_console_ID = console selection from user
-- where :photo = image uploaded by User

-- 11. Games page
--		Display games info using game_ID, console_ID from User clicking on the link
--		here, let's say game is Yakuza 0 (5), and console is PS4 (1)
SELECT console_name, Games.game_ID, photo, game_name, description, release_date, AVG(rating) AS rating FROM Games
JOIN Consoles_Games ON Games.game_ID = Consoles_Games.game_ID
JOIN Consoles ON Consoles_Games.console_ID = Consoles.console_ID
LEFT JOIN Reviews ON Consoles.console_ID = Reviews.console_ID AND Games.game_ID = Reviews.game_ID
WHERE Games.game_ID = 5 AND Consoles.console_id = 1;
--		Display genres
SELECT genre_name FROM Genres
JOIN Genres_Games ON Genres.genre_ID = Genres_Games.genre_ID
JOIN Games ON Genres_Games.game_ID = Games.game_ID
WHERE Games.game_ID = 5;
--		Display Consoles and URL for them
SELECT Consoles.console_ID, console_name FROM Consoles
JOIN Consoles_Games ON Consoles.console_ID = Consoles_Games.console_ID
JOIN Games ON Consoles_Games.game_ID = Games.game_ID
WHERE Games.game_ID = 5;
--		Delete Game (Consoles_Games entity)
DELETE FROM Consoles_Games WHERE console_ID = 1 AND game_ID = 5;
--		Display Reviews
SELECT user_name, rating, review_date, title, content FROM Reviews
JOIN Users ON Reviews.user_ID = Users.user_ID WHERE game_ID = 5 AND console_ID = 1;

-- 12. Add Review page
--		Already have game_ID, console_ID, game_name, console_name, user_ID
--		Insert Review
INSERT INTO Reviews (user_ID, console_ID, game_ID, review_date, title, rating, content)
VALUES (:user_ID, :console_ID, :game_ID, :review_date, :title, :rating, :content);
-- where :user_ID is int from existing info, :console_ID is int from existing info,
-- where :game_ID is int from existing info, :review_date is from current date,
-- where :title is text from User, :rating is from User selection, :content is text from User