/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-expressions */
const request = require('supertest');
const httpStatus = require('http-status');
const { expect } = require('chai');
const { _ } = require('lodash');
const { some } = require('lodash');
const app = require('../../../index');
const User = require('../../models/user.model');
const Article = require('../../models/article.model');
const Claim = require('../../models/claim.model');

describe('Claim API', async () => {
  let userAccessToken;
  let user2AccessToken;
  let user;
  let user2;
  let article;
  let claim1;
  let claim2;
  let claim1Updated;
  let claim1Id;

  before(async () => {
    await Claim.deleteMany({});
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

    user2 = {
      _id: '41224d776a326fb40f000010',
      email: 'usertest@gmail.com',
      password: '123456',
      name: 'Xddd',
      firstName: 'ddddd',
      lastName: 'Priezdvisko',
    };

    await Article.deleteMany({});
    await User.deleteMany({});

    article = {
      _id: '41224d776a326fb40f000002',
      addedBy: user._id,
      title: 'Lorem Ipsum title',
      text: 'Lorem Ipsum is simply dummg industry. Lorem Ipsum has been the industry',
      sourceUrl: 'https://www.lipsum.com/',
      sourceType: 'article',
      language: 'en',
    };

    claim1 = {
      text: 'Prvy claim hh nejaky nahodny text. Nema to ziadny zmysel, ale vsak to nie je podsatatne..',
    };

    claim2 = {
      text: 'ADdqwd qwqw56d 6dqw56qw  aasaaaa hh nejaky nahodny text. Lorem ipsum alebo take daco hmm..',
    };

    claim1Updated = {
      text: 'updated text of claim',
    };

    await User.create(user);
    userAccessToken = (await User.findAndGenerateToken(user)).accessToken;
    await User.create(user2);
    user2AccessToken = (await User.findAndGenerateToken(user2)).accessToken;

    await Article.create(article);
  });

  describe('POST /v1/articles/:articleId/claims', () => {
    it('should create a new article', () => {
      return request(app)
        .post(`/v1/articles/${article._id}/claims`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(claim1)
        .expect(httpStatus.CREATED)
        .then((res) => {
          claim1Id = res.body._id;
          expect(res.body).to.have.a.property('_id');
          expect(res.body).to.have.a.property('createdAt');
          expect(res.body.addedBy._id).to.be.equal(user._id);
          expect(res.body.text).to.be.equal(claim1.text);
          expect(res.body.nBeenVoted).to.be.equal(0);
          // expect(res.body.language).to.be.equal(claim1.language);
        });
    });

    it('should create a new article', () => {
      return request(app)
        .post(`/v1/articles/${article._id}/claims`)
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .send(claim2)
        .expect(httpStatus.CREATED)
        .then((res) => {
          expect(res.body).to.have.a.property('_id');
          expect(res.body).to.have.a.property('createdAt');
          expect(res.body.addedBy._id).to.be.equal(user2._id);
          expect(res.body.text).to.be.equal(claim2.text);
          expect(res.body.nBeenVoted).to.be.equal(0);
        });
    });

    it('should report error when text is not provided', () => {
      return request(app)
        .post(`/v1/articles/${article._id}/claims`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(_.omit(claim2, ['text']))
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          const { field } = res.body.errors[0];
          const { location } = res.body.errors[0];
          const { messages } = res.body.errors[0];
          expect(field).to.be.equal('text');
          expect(location).to.be.equal('body');
          expect(messages).to.include('"text" is required');
        });
    });

    it('should report error when user has no auth', () => {
      return request(app)
        .post('/v1/articles')
        .set('Authorization', 'Bearer ')
        .send(_.omit(claim2, ['language']))
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /v1/articles/:articleId/claims', async () => {
    it('should list claims for article', async () => {
      const xArticles = await Article.find({});

      return request(app)
        .get(`/v1/articles/${xArticles[0]._id}/claims`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.OK)
        .then(async (res) => {
          const includesClaim1 = some(res.body, claim1);
          const includesClaim2 = some(res.body, claim2);

          expect(res.body).to.be.an('array');
          expect(res.body).to.have.lengthOf(2);
          expect(includesClaim1).to.be.true;
          expect(includesClaim2).to.be.true;

          expect(res.body[0]).to.have.a.property('_id');
          expect(res.body[0]).to.have.a.property('text');
          expect(res.body[0]).to.have.a.property('addedBy');
          expect(res.body[0].nBeenVoted).to.be.equal(0);

          expect(res.body[0].addedBy).to.have.a.property('firstName');
          expect(res.body[0].addedBy).to.have.a.property('lastName');
          expect(res.body[0].addedBy).to.have.a.property('email');
          expect(res.body[0].addedBy).to.have.a.property('_id');
        });
    });
  });

  describe('GET /v1/articles/:articleId/claims/:claimId', async () => {
    const xArticles = await Article.find({});
    const xClaims = (await Claim.find({}));

    it('should get selected claim for article', () => {
      return request(app)
        .get(`/v1/articles/${xArticles[0]._id}/claims/${xClaims[0]._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.OK)
        .then(async (res) => {
          expect(res.body).to.be.an('object');

          expect(res.body.addedBy).to.have.a.property('firstName');
          expect(res.body.addedBy).to.have.a.property('lastName');
          expect(res.body.addedBy).to.have.a.property('email');
          expect(res.body.addedBy).to.have.a.property('_id');
          expect(res.body.nBeenVoted).to.be.equal(0);

          expect(res.body).to.not.have.a.property('articleId');
          expect(res.body.article).to.have.a.property('_id');
          expect(res.body.article._id).to.be.equal(xArticles[0]._id);
        });
    });
  });

  describe('PUT /v1/articles/:articleId/claims/:claimId', () => {
    it('should replace claim', async () => {
      const xArticles = await Article.find({});

      return request(app)
        .put(`/v1/articles/${xArticles[0]._id}/claims/${claim1Id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(claim1Updated)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.include(claim1Updated);

          expect(res.body._id).to.be.equal(claim1Id);
          expect(res.body.text).to.be.equal(claim1Updated.text);
          expect(res.body.article._id).to.be.equal(xArticles[0]._id.toString());
          expect(res.body.articles).to.include(xArticles[0]._id.toString());

          expect(res.body.addedBy._id).to.be.equal(user._id);
          expect(res.body.addedBy).to.have.a.property('firstName');
          expect(res.body.addedBy).to.have.a.property('lastName');
          expect(res.body.addedBy).to.have.a.property('email');
        });
    });

    it('should report error when text is not provided', async () => {
      const xArticles = await Article.find({});

      return request(app)
        .put(`/v1/articles/${xArticles[0]._id}/claims/${claim1Id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(_.omit(claim1Updated, ['text']))
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          const { field, location, messages } = res.body.errors[0];

          expect(field).to.be.equal('text');
          expect(location).to.be.equal('body');
          expect(messages).to.include('"text" is required');
        });
    });

    it('should report error when sourceUrl is shorter than 5', async () => {
      const xArticles = await Article.find({});
      const newClaimToUpdate = {
        text: 'xdd',
      };

      return request(app)
        .put(`/v1/articles/${xArticles[0]._id}/claims/${claim1Id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(newClaimToUpdate)
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          const { field, location, messages } = res.body.errors[0];

          expect(field).to.be.equal('text');
          expect(location).to.be.equal('body');
          expect(messages).to.include('"text" length must be at least 6 characters long');
        });
    });

    it('should report error "Claim does not exist" when claim does not exists', async () => {
      const xArticles = await Article.find({});

      return request(app)
        .put(`/v1/articles/${xArticles[0]._id}/claims/tenerife`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.code).to.be.equal(404);
          expect(res.body.message).to.be.equal('Claim does not exist');
        });
    });

    it('should report error when logged user is not the owner of claim', async () => {
      const xArticles = await Article.find({});

      return request(app)
        .put(`/v1/articles/${xArticles[0]._id}/claims/${claim1Id}`)
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .send(claim1Updated)
        .expect(httpStatus.FORBIDDEN)
        .then((res) => {
          expect(res.body.code).to.be.equal(httpStatus.FORBIDDEN);
          expect(res.body.message).to.be.equal('Forbidden to perform this action over selected resource.');
        });
    });
  });

  describe('PATCH /v1/articles/:articleId/claims/:claimId', () => {
    it('should update claim', async () => {
      const xArticles = await Article.find({});
      const text = 'new text field';

      return request(app)
        .patch(`/v1/articles/${xArticles[0]._id}/claims/${claim1Id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({ text })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.text).to.be.equal(text);

          expect(res.body._id).to.be.equal(claim1Id);

          expect(res.body.text).to.be.equal(text);
          expect(res.body.article._id).to.be.equal(xArticles[0]._id.toString());
          expect(res.body.articles).to.include(xArticles[0]._id.toString());

          expect(res.body.addedBy._id).to.be.equal(user._id);
          expect(res.body.addedBy).to.have.a.property('firstName');
          expect(res.body.addedBy).to.have.a.property('lastName');
          expect(res.body.addedBy).to.have.a.property('email');
        });
    });

    it('should not update claim when no parameters were given', async () => {
      const xArticles = await Article.find({});

      return request(app)
        .patch(`/v1/articles/${xArticles[0]._id}/claims/${claim1Id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send()
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.text).to.be.equal('new text field'); // from previous test
        });
    });

    it('should report error "Claim does not exist" when claim does not exists', async () => {
      const xArticles = await Article.find({});

      return request(app)
        .patch(`/v1/articles/${xArticles[0]._id}/claims/arrecife`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.code).to.be.equal(404);
          expect(res.body.message).to.be.equal('Claim does not exist');
        });
    });

    it('should report error when logged user is not the same as the owner', async () => {
      const xArticles = await Article.find({});

      return request(app)
        .patch(`/v1/articles/${xArticles[0]._id}/claims/${claim1Id}`)
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .expect(httpStatus.FORBIDDEN)
        .then((res) => {
          expect(res.body.code).to.be.equal(httpStatus.FORBIDDEN);
          expect(res.body.message).to.be.equal('Forbidden to perform this action over selected resource.');
        });
    });
  });

  describe('DELETE /v1/articles/:articleId/claims/:claimId', () => {
    it('should report error when logged user is not the same as the owner', async () => {
      const xArticles = await Article.find({});

      return request(app)
        .delete(`/v1/articles/${xArticles[0]._id}/claims/${claim1Id}`)
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .expect(httpStatus.FORBIDDEN)
        .then((res) => {
          expect(res.body.code).to.be.equal(httpStatus.FORBIDDEN);
          expect(res.body.message).to.be.equal('Forbidden to perform this action over selected resource.');
        });
    });

    it('should delete claim', async () => {
      const xArticles = await Article.find({});

      return request(app)
        .delete(`/v1/articles/${xArticles[0]._id}/claims/${claim1Id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.NO_CONTENT)
        .then(() => request(app).get('/v1/articles'))
        .then(async () => {
          const articles = await Article.find({});
          expect(articles).to.have.lengthOf(1);
        });
    });

    it('should report error "Claim does not exist" when claim does not exists', async () => {
      const xArticles = await Article.find({});

      return request(app)
        .delete(`/v1/articles/${xArticles[0]._id}/claims/maspalomas`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.code).to.be.equal(404);
          expect(res.body.message).to.be.equal('Claim does not exist');
        });
    });
  });

  describe('GET /v1/users/:userId/claims', () => {
    it('should list claims of user', () => {
      return request(app)
        .get(`/v1/users/${user2._id}/claims`)
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .expect(httpStatus.OK)
        .then(async (res) => {
          const includesArticle2 = some(res.body, claim2);

          expect(res.body).to.be.an('array');
          expect(res.body).to.have.lengthOf(1);
          expect(includesArticle2).to.be.true;

          expect(res.body[0].addedBy._id).to.be.equal(user2._id);
        });
    });

    it('should return forbidden for listing other users claims', () => {
      return request(app)
        .get(`/v1/users/${user._id}/claims`)
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .expect(httpStatus.FORBIDDEN);
    });
  });
});
