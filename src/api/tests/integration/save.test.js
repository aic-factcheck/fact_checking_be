/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-expressions */
const request = require('supertest');
const httpStatus = require('http-status');
const { expect } = require('chai');
const app = require('../../../index');
const User = require('../../models/user.model');
const Article = require('../../models/article.model');
const SavedArticle = require('../../models/savedArticle.model');

const getArticleById = async (articleId,accessToken) => {
  return request(app)
    .get(`/v1/articles/${articleId}`)
    .set('Authorization', `Bearer ${accessToken}`)
    .expect(httpStatus.OK)
    .then((res) => res.body);
};

describe('SAVE-article API', async () => {
  let userAccessToken;
  let user;
  let article;

  before(async () => {
    await SavedArticle.deleteMany({});
    await Article.deleteMany({});
    await User.deleteMany({});
  });

  beforeEach(async () => {
    user = {
      _id: '41224d776a326fb40f000001',
      email: 'user1@gmail.com',
      password: '123456',
      name: 'Admin User',
      firstName: 'Meno',
      lastName: 'Priezvisko',
    };

    article = {
      _id: '41224d776a326fb40f000002',
      addedBy: user._id,
      title: 'Lorem Ipsum title',
      text: 'Lorem Ipsum is simply dummg industry. Lorem Ipsum has been the industry',
      sourceUrl: 'https://www.lipsum.com/',
      sourceType: 'article',
      lang: 'en',
      nSaved: 0,
    };

    await Article.deleteMany({});
    await User.deleteMany({});

    await User.create(user);
    userAccessToken = (await User.findAndGenerateToken(user)).accessToken;

    await Article.create(article);
  });

  describe('POST /v1/save?articleId=', () => {
    it('Should save a selected article', async () => {
      return request(app)
        .post(`/v1/save?articleId=${article._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({})
        .expect(httpStatus.CREATED)
        .then((res) => {
          expect(res.body).to.have.a.property('_id');
          expect(res.body).to.have.a.property('createdAt');
          expect(res.body.addedBy).to.be.equal(user._id);
          expect(res.body.articleId).to.be.equal(article._id);
        })
        .then(async () => {
          const reqArticle = await getArticleById(article._id, userAccessToken);

          expect(reqArticle.nSaved).to.be.equal(article.nSaved + 1);
          article.nSaved += 1;
        });
    });

    it('Should not save already saved article', async () => {
      return request(app)
        .post(`/v1/save?articleId=${article._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({})
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.message).to.be.equal('Article already saved');
        })
        .then(async () => {
          const reqArticle = await getArticleById(article._id, userAccessToken);
          expect(reqArticle.nSaved).to.be.equal(article.nSaved);
        });
    });

    it('Should return error if article is already saved', async () => {
      return request(app)
        .post(`/v1/save?articleId=${user._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({})
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.message).to.be.equal('ArticleId not valid');
        })
        .then(async () => {
          const reqArticle = await getArticleById(article._id, userAccessToken);
          expect(reqArticle.nSaved).to.be.equal(article.nSaved);
        });
    });
  });

  describe('GET /v1/articles/saved', async () => {
    // it('should list articles saved by current user', () => {
    //   return request(app)
    //     .get('/v1/articles/saved')
    //     .set('Authorization', `Bearer ${userAccessToken}`)
    //     .expect(httpStatus.OK)
    //     .then(async (res) => {
    //       expect(res.body).to.be.an('array');
    //       expect(res.body).to.have.lengthOf(1);

    //       expect(res.body[0].addedBy).to.have.a.property('firstName');
    //       expect(res.body[0].addedBy).to.have.a.property('lastName');
    //       expect(res.body[0].addedBy).to.have.a.property('email');
    //       expect(res.body[0].addedBy).to.have.a.property('_id');
    //       expect(res.body[0].nBeenVoted).to.be.equal(0);
    //     });
    // });
  });

  describe('DELETE /v1/save?articleId=', async () => {
    // it('Should return error if article does not exists', () => {
    //   return request(app)
    //     .delete(`/v1/save?articleId=${article._id}`)
    //     .set('Authorization', `Bearer ${userAccessToken}`)
    //     .expect(httpStatus.BAD_REQUEST)
    //     .then(async () => {});
    // });

    it('Should unsave selected article', () => {
      return request(app)
        .delete(`/v1/save?articleId=${article._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.NO_CONTENT)
        .then(async () => {});
    });
  });
});
