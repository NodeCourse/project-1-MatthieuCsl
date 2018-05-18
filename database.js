const Sequelize = require('sequelize');
const db = new Sequelize('blogv2', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});

//setup des models
const User = db.define('user', {
  fullname: { type: Sequelize.STRING },
  email: { type: Sequelize.STRING },
  password: { type: Sequelize.STRING }

});

const Article = db.define('article', {
  title: { type: Sequelize.STRING },
  description: { type: Sequelize.STRING },
  content: { type: Sequelize.STRING },
  photo: { type: Sequelize.STRING },
  note: { type: Sequelize.STRING }
});

const Commentary = db.define('comment', {
  titre: { type: Sequelize.STRING },
  contenu: { type: Sequelize.STRING },
  autor: { type: Sequelize.STRING }
});

const Vote = db.define('vote', {
  type: {
    type: Sequelize.ENUM('up', 'down')
  }
});

//definition des relations
Article.hasMany(Vote);
Vote.belongsTo(Article);

Article.hasMany(Commentary);
Commentary.belongsTo(Article);
Commentary.belongsTo(User);

User.hasMany(Article);
Article.belongsTo(User);

//Rate.belongsTo(Article);

module.exports.db = db;
module.exports.User = User;
module.exports.Comment = Commentary;
module.exports.Article = Article;
module.exports.Vote = Vote;
//module.exports.Rate = Rate;
