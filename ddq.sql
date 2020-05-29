-- phpMyAdmin SQL Dump
-- version 4.9.4
-- https://www.phpmyadmin.net/
--
-- Host: classmysql.engr.oregonstate.edu:3306
-- Generation Time: May 20, 2020 at 04:37 PM
-- Server version: 10.4.11-MariaDB-log
-- PHP Version: 7.4.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cs340_wukev`
--

-- --------------------------------------------------------

--
-- Table structure for table `Consoles`
--

DROP TABLE IF EXISTS `Consoles`;
CREATE TABLE `Consoles` (
  `console_ID` int(11) NOT NULL,
  `console_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Consoles`
--

INSERT INTO `Consoles` (`console_ID`, `console_name`) VALUES
(1, 'PS4'),
(2, 'Xbox One'),
(3, 'Switch'),
(4, 'Windows PC'),
(5, 'MacOS PC'),
(6, 'Stadia'),
(7, 'Android'),
(8, 'iOS');

-- --------------------------------------------------------

--
-- Table structure for table `Consoles_Games`
--

DROP TABLE IF EXISTS `Consoles_Games`;
CREATE TABLE `Consoles_Games` (
  `console_ID` int(11) NOT NULL,
  `game_ID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Consoles_Games`
--

INSERT INTO `Consoles_Games` (`console_ID`, `game_ID`) VALUES
(1, 1),
(1, 5),
(1, 6),
(1, 7),
(1, 9),
(1, 10),
(2, 4),
(2, 5),
(2, 7),
(2, 9),
(2, 10),
(3, 3),
(3, 9),
(3, 10),
(4, 2),
(4, 4),
(4, 5),
(4, 7),
(4, 8),
(4, 9),
(4, 10),
(4, 11),
(5, 9),
(5, 10),
(6, 7),
(7, 8),
(8, 8);

-- --------------------------------------------------------

--
-- Table structure for table `Games`
--

DROP TABLE IF EXISTS `Games`;
CREATE TABLE `Games` (
  `game_ID` int(11) NOT NULL,
  `game_name` varchar(255) NOT NULL,
  `release_date` date NOT NULL,
  `description` text DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Games`
--

INSERT INTO `Games` (`game_ID`, `game_name`, `release_date`, `description`, `photo`) VALUES
(1, 'Persona 5 Royal', '2020-03-31', 'Prepare for an all-new RPG experience in Persona 5 Royal based in the universe of the award-winning series, Persona! Don the mask of Joker and join the Phantom Thieves of Hearts. Break free from the chains of modern society and stage grand heists to infiltrate the minds of the corrupt and make them change their ways! Persona 5 Royal is packed with new characters, confidants, story depth, new locations to explore, and a new grappling hook mechanic for stealthy access to new areas. With a new semester at Shujin Academy, get ready to strengthen your abilities in the metaverse and in your daily life. Persona 5 Royal presents a unique visual style and award nominated composer Shoji Meguro returns with an all-new soundtrack. Explore Tokyo, unlock new Personas, customize your own personal Thieves Den, discover a never-before-seen story arc, cutscenes, alternate endings, and more! Even for the most seasoned Phantom Thieves among us, Persona 5 Royal is a new challenge to defy conventions, discover the power within, and fight for justice. Wear the mask. Reveal your truth.', NULL),
(2, 'Half-Life: Alyx', '2020-03-23', 'Half-Life: Alyx is Valve\'s VR return to the Half-Life series. It\'s the story of an impossible fight against a vicious alien race known as the Combine, set between the events of Half-Life and Half-Life 2. Playing as Alyx Vance, you are humanity\'s only chance for survival. The Combine\'s control of the planet since the Black Mesa incident has only strengthened as they corral the remaining population in cities. Among them are some of Earth\'s greatest scientists: you and your father, Dr. Eli Vance. As founders of a fledgling resistance, you\'ve continued your clandestine scientific activityperforming critical research, and building invaluable tools for the few humans brave enough to defy the Combine. Every day, you learn more about your enemy, and every day you work toward finding a weakness.\r\n\r\n    ABOUT GAMEPLAY IN VR:\r\n\r\n    Valve\'s return to the Half-Life universe that started it all was built from the ground up for virtual reality. VR was built to enable the gameplay that sits at the heart of Half-Life.\r\n\r\n    Immerse yourself in deep environmental interactions, puzzle solving, world exploration, and visceral combat.\r\n\r\n    Lean to aim around a broken wall and under a Barnacle to make an impossible shot. Rummage through shelves to find a healing syringe and some shotgun shells. Manipulate tools to hack alien interfaces. Toss a bottle through a window to distract an enemy. Rip a Headcrab off your face and throw it at a Combine soldier.\r\n\r\n    Extra content for Index owners\r\n    Customers who have purchased Valve Index hardware by the end of 2019 will have access to unique bonuses starting early next year:\r\n\r\n    * Explore environments from Half-Life: Alyx in your SteamVR Home space\r\n    * Alternate gun skins to embellish Alyx\'s arsenal\r\n    * Special Half-Life: Alyx-themed content for Counter-Strike: Global Offensive and Dota 2\r\n\r\n    Community-built environments\r\n\r\n    * A set of Source 2 tools for building new environments will ship with the game, enabling any player to build and contribute new environments for the community to enjoy. Hammer, Valve\'s level authoring tool, has been updated with all of the game\'s virtual reality gameplay tools and components.', NULL),
(3, 'Animal Crossing: New Horizons', '2020-03-20', 'If the hustle and bustle of modern life’s got you down, Tom Nook has a new business venture up his sleeve that he knows you’ll adore: the Nook Inc. Deserted Island Getaway Package. Sure, you’ve crossed paths with colorful characters near and far. Had a grand time as one of the city folk. May’ve even turned over a new leaf and dedicated yourself to public service. But deep down, isn’t there a part of you that longs for…freedom? Then perhaps a long walk on the beach of a deserted island, where a rich wealth of untouched nature awaits, is just what the doctor ordered. Peaceful creativity and charm await as you roll up your sleeves and make your new life whatever you want it to be. Collect resources and craft everything from creature comforts to handy tools. Embrace your green thumb as you interact with flowers and trees in new ways. Set up a homestead where the rules of what goes indoors and out no longer apply. Make friends with new arrivals, enjoy the seasons, pole-vault across rivers as you explore, and more.', NULL),
(4, 'Ori and the Will of the Wisps', '2020-03-11', 'The little spirit Ori is no stranger to peril, but when a fateful flight puts the owlet Ku in harm’s way, it will take more than bravery to bring a family back together, heal a broken land, and discover Ori’s true destiny. From the creators of the acclaimed action-platformer Ori and the Blind Forest comes the highly anticipated sequel. Embark on an all-new adventure in a vast world filled with new friends and foes that come to life in stunning, hand-painted artwork. Set to a fully orchestrated original score, Ori and the Will of the Wisps continues the Moon Studios tradition of tightly crafted platforming action and deeply emotional storytelling.', NULL),
(5, 'Yakuza 0', '2020-02-26', 'Tokyo 1988. Getting rich is easy, the women are beautiful, and everyone wants in on the action. It\'s time to become Yakuza. \r\n    \r\n    The glitz, glamour, and unbridled decadence of the 80s are back in Yakuza 0!\r\n    \r\n    Fight like hell through Tokyo and Osaka with protagonist Kazuma Kiryu and series regular Goro Majima. Play as Kazuma Kiryu and discover how he finds himself in a world of trouble when a simple debt collection goes wrong and his mark winds up murdered. Then, step into the silver-toed shoes of Goro Majima and explore his \"normal\" life as the proprietor of a cabaret club.\r\n    \r\n    Switch between three different fighting styles instantaneously and beat up all manner of goons, thugs, hoodlums, and lowlifes. Take combat up a notch by using environmental objects such as bicycles, sign posts, and car doors for bone-crunching combos and savage take-downs.\r\n    \r\n    Fighting is not the only way to kill time in 1988\'s Japan: from discos and hostess clubs to classic SEGA arcades, there are tons of distractions to pursue in the richly detailed, neon-lit world.\r\n    \r\n    Interact with the colourful denizens the red light district: help a budding S&M dominatrix learn her profession, or ensure a street performer can make it to the bathroom in time there are 100 incredible stories to discover.', NULL),
(6, 'Dreams', '2020-02-14', 'Dreams is the space you go to where you go to play and experience the dreams of Media Molecule and its community. It’s also a space in which to create your own dreams, whether they’re games, art, films, music or anything in-between and beyond. [Media Molecule]', NULL),
(7, 'Doom Eternal', '2020-03-19', 'DOOM Eternal is the direct sequel to 2016\'s DOOM. Developed by id Software, DOOM Eternal delivers the ultimate combination of speed and power, along with the next leap in push-forward, first-person combat. As the DOOM Slayer, you’ll return to take your vengeance against the forces of Hell. Set to an all-new pulse-pounding soundtrack composed by Mick Gordon, you fight across dimensions as you slay new and classic demons with powerful new weapons and abilities. [Bethesda]', NULL),
(8, 'Legends of Runeterra', '2020-04-29', 'Face off in dynamic, alternating combat full of opportunities to adapt and outplay. Make your move, but be ready to react, because your opponent has a plan of their own. It all comes down to this—can you outwit them and win?', NULL),
(9, 'Huntdown', '2020-05-12', 'Challenge yourselves in this hard-boiled co-op arcade shooter! Run, jump, and take cover in the mayhem-filled streets of the future. Kill the henchmen, take their guns, and Huntdown the leaders! Collect the bounty, level by level, and make a healthy living by making living unhealthy.', NULL),
(10, 'Fury Unleashed', '2020-05-08', 'Fury Unleashed is an action platformer where you shoot your way through the pages of an ever-changing comic book. Take advantage of unique combo system to unleash your fury and become a whirling tornado of destruction. Discover why your creator doubted in you and prove him wrong.', NULL),
(11, 'World of Warcraft', '2004-02-02', '', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `Genres`
--

DROP TABLE IF EXISTS `Genres`;
CREATE TABLE `Genres` (
  `genre_ID` int(11) NOT NULL,
  `genre_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Genres`
--

INSERT INTO `Genres` (`genre_ID`, `genre_name`) VALUES
(1, 'Action'),
(2, 'Adventure'),
(19, 'Beat\'em Up'),
(3, 'Fighting Games'),
(4, 'First-person Shooters'),
(5, 'Flight/flying'),
(6, 'Party'),
(7, 'Platformer'),
(8, 'Puzzle'),
(9, 'Racing'),
(10, 'Real-time Strategy'),
(11, 'Role-playing'),
(12, 'Simulation'),
(13, 'Sports'),
(14, 'Strategy'),
(15, 'Third-person Shooter'),
(16, 'Turn-based Strategy'),
(17, 'Wargames'),
(18, 'Wrestling');

-- --------------------------------------------------------

--
-- Table structure for table `Genres_Games`
--

DROP TABLE IF EXISTS `Genres_Games`;
CREATE TABLE `Genres_Games` (
  `genre_ID` int(11) NOT NULL,
  `game_ID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Genres_Games`
--

INSERT INTO `Genres_Games` (`genre_ID`, `game_ID`) VALUES
(1, 2),
(1, 4),
(1, 5),
(1, 6),
(1, 7),
(1, 9),
(1, 10),
(1, 11),
(2, 5),
(2, 6),
(4, 2),
(4, 7),
(7, 4),
(7, 10),
(11, 1),
(12, 3),
(14, 8);

-- --------------------------------------------------------

--
-- Table structure for table `Reviews`
--

DROP TABLE IF EXISTS `Reviews`;
CREATE TABLE `Reviews` (
  `review_ID` int(11) NOT NULL,
  `user_ID` int(11) NOT NULL,
  `console_ID` int(11) NOT NULL,
  `game_ID` int(11) NOT NULL,
  `review_date` date NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `rating` int(2) NOT NULL,
  `content` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Reviews`
--

INSERT INTO `Reviews` (`review_ID`, `user_ID`, `console_ID`, `game_ID`, `review_date`, `title`, `rating`, `content`) VALUES
(1, 3, 1, 6, '2020-02-28', 'Astonishing', 10, 'There\'s already enough content to justify the price, but it\'s the potential for what comes next not just in terms out output but the Dreams toolset itself.'),
(2, 4, 4, 7, '2020-05-01', 'Thanks for nothing', 0, 'Don\'t buy until they fix the issues with or remove the DRm.\r\n\r\nThe recent update now makes the game unplayable without giving Administrative privileges to \'Denuvo\'. There\'s no telling what this could do on your computer with these invasive permissions and now makes my full game purchase Unplayable. Antivirus software is detecting this as a threat.\r\n\r\nI understand the focus on multiplayer but there\'s absolutely no way I would trust an anti-cheat software to have full control over my computer for a game.'),
(3, 4, 8, 8, '2020-05-05', 'It\'s alright', 6, 'To start, Legends of Runeterra is a pretty good game all things considered. Its in game economy is cheap and you win a really good amount of stuff via weekend vaults, quests, expeditions, and region loot. The interface is gorgeous. The base mechanics of the game are reallygood and require a lot of thought. However, this game is an absolute nightmare when it comes to competitive play. The meta right now is entirely RNG and your success will come down to if you win or lose the dice roll, if you open well (bc if you dont you just lose bc it snowballs out of your control), and if you dont come up against an auto loss matchup, which there are many for many decks.\r\n\r\nLoR is a game with a bright future, but riot needs to iron out some things before i can say id recommend it'),
(4, 5, 5, 9, '2020-05-15', 'Close to perfect', 9, 'One of the best side scrolling shooter I\'ve played, and the cover system brings some welcomed depth to the gameplay. It\'s not a very long game, but it\'s challenging enough to keep you busy for a while. '),
(5, 5, 3, 10, '2020-05-09', 'You\'ll have a great time', 7, 'Fury Unleashed knows how to deliver an engaging gameplay, thanks to its combo system fast-paced design.'),
(6, 1, 1, 1, '2020-04-01', 'Awesome RPG!', 9, 'Very fun story and gameplay! It was the best PS4 game I\'ve played this year!'),
(7, 1, 4, 2, '2020-04-10', 'BEST VR Experience EVER!', 10, 'Best VR game ever! Really lived up to Half-Life\'s legacy. Very immersive and great physics.'),
(8, 2, 3, 3, '2020-05-10', 'animal crossing!!', 8, 'pretty good! not bad at all. not as good as the previous animal crossings though.'),
(9, 2, 4, 4, '2020-05-10', 'Fun!', 8, 'I loved the story, art and music! The gameplay was very fluid and fun! Would recommend to others!'),
(10, 3, 1, 5, '2020-03-12', 'Solid Yakuza game!', 9, 'A great game in the Yakuza series! I loved the world and things I can do in the game! Did not disappoint.'),
(11, 1, 1, 5, '2020-03-13', 'FUN!', 3, 'Good game!'),
(13, 6, 4, 2, '2020-06-02', NULL, 8, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
CREATE TABLE `Users` (
  `user_ID` int(11) NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `pref_console_ID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Users`
--

INSERT INTO `Users` (`user_ID`, `user_name`, `password`, `email`, `photo`, `pref_console_ID`) VALUES
(1, 'wukev', 'password', 'wukev@oregonstate.edu', NULL, 4),
(2, 'april', '1234', 'april@hotmail.com', NULL, 2),
(3, 'nyo', 'joiwjw', 'nyo@hotmail.com', NULL, NULL),
(4, 'catlover12', '111111', 'catlover@gmail.com', NULL, NULL),
(5, 'jeff', 'bezos', 'jeff@amazon.com', NULL, NULL),
(6, 'catz', 'dogz', 'dog@hotmail.com', NULL, 5);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Consoles`
--
ALTER TABLE `Consoles`
  ADD PRIMARY KEY (`console_ID`),
  ADD UNIQUE KEY `console_name` (`console_name`);

--
-- Indexes for table `Consoles_Games`
--
ALTER TABLE `Consoles_Games`
  ADD PRIMARY KEY (`console_ID`,`game_ID`),
  ADD KEY `game_ID` (`game_ID`);

--
-- Indexes for table `Games`
--
ALTER TABLE `Games`
  ADD PRIMARY KEY (`game_ID`),
  ADD UNIQUE KEY `game_name` (`game_name`);

--
-- Indexes for table `Genres`
--
ALTER TABLE `Genres`
  ADD PRIMARY KEY (`genre_ID`),
  ADD UNIQUE KEY `genre_name` (`genre_name`);

--
-- Indexes for table `Genres_Games`
--
ALTER TABLE `Genres_Games`
  ADD PRIMARY KEY (`genre_ID`,`game_ID`),
  ADD KEY `game_ID` (`game_ID`);

--
-- Indexes for table `Reviews`
--
ALTER TABLE `Reviews`
  ADD PRIMARY KEY (`review_ID`),
  ADD KEY `user_ID` (`user_ID`),
  ADD KEY `console_ID` (`console_ID`,`game_ID`);

--
-- Indexes for table `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`user_ID`),
  ADD UNIQUE KEY `user_name` (`user_name`),
  ADD KEY `pref_console_ID` (`pref_console_ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Consoles`
--
ALTER TABLE `Consoles`
  MODIFY `console_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `Games`
--
ALTER TABLE `Games`
  MODIFY `game_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `Genres`
--
ALTER TABLE `Genres`
  MODIFY `genre_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `Reviews`
--
ALTER TABLE `Reviews`
  MODIFY `review_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `Users`
--
ALTER TABLE `Users`
  MODIFY `user_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Consoles_Games`
--
ALTER TABLE `Consoles_Games`
  ADD CONSTRAINT `Consoles_Games_ibfk_1` FOREIGN KEY (`console_ID`) REFERENCES `Consoles` (`console_ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `Consoles_Games_ibfk_2` FOREIGN KEY (`game_ID`) REFERENCES `Games` (`game_ID`) ON DELETE CASCADE;

--
-- Constraints for table `Genres_Games`
--
ALTER TABLE `Genres_Games`
  ADD CONSTRAINT `Genres_Games_ibfk_1` FOREIGN KEY (`genre_ID`) REFERENCES `Genres` (`genre_ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `Genres_Games_ibfk_2` FOREIGN KEY (`game_ID`) REFERENCES `Games` (`game_ID`) ON DELETE CASCADE;

--
-- Constraints for table `Reviews`
--
ALTER TABLE `Reviews`
  ADD CONSTRAINT `Reviews_ibfk_1` FOREIGN KEY (`user_ID`) REFERENCES `Users` (`user_ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `Reviews_ibfk_2` FOREIGN KEY (`console_ID`,`game_ID`) REFERENCES `Consoles_Games` (`console_ID`, `game_ID`) ON DELETE CASCADE;

--
-- Constraints for table `Users`
--
ALTER TABLE `Users`
  ADD CONSTRAINT `Users_ibfk_1` FOREIGN KEY (`pref_console_ID`) REFERENCES `Consoles` (`console_ID`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
