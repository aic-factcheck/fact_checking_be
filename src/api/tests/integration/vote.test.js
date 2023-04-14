/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-expressions */
const request = require('supertest');
const httpStatus = require('http-status');
const { expect } = require('chai');
const app = require('../../../index');
const User = require('../../models/user.model');
const Article = require('../../models/article.model');
const Claim = require('../../models/claim.model');
const Review = require('../../models/review.model');
const Vote = require('../../models/vote.model');

const reviewById = async (articleId, claimId, reviewId, accessToken) => {
  return request(app)
    .get(`/v1/articles/${articleId}/claims/${claimId}/reviews/${reviewId}`)
    .set('Authorization', `Bearer ${accessToken}`)
    .expect(httpStatus.OK)
    .then((res) => res.body);
};

const getClaimById = async (articleId, claimId, accessToken) => {
  return request(app)
    .get(`/v1/articles/${articleId}/claims/${claimId}`)
    .set('Authorization', `Bearer ${accessToken}`)
    .expect(httpStatus.OK)
    .then((res) => res.body);
};

describe('VOTE API', async () => {
  let userAccessToken;
  let user2AccessToken;
  let user1;
  let user2;
  let article1;
  let article2;
  let claim1;
  let claim2;
  let review1;
  let review2;
  let positiveVote;
  let negVote;
  let neutralVote;

  before(async () => {
    await Vote.deleteMany({});
    await Review.deleteMany({});
    await Claim.deleteMany({});
    await Article.deleteMany({});
    await User.deleteMany({});
  });

  beforeEach(async () => {
    positiveVote = {
      rating: 1,
    };

    negVote = {
      rating: -1,
    };

    neutralVote = {
      rating: 0,
    };

    user1 = {
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

    article1 = {
      _id: '41224d776a326fb40f000002',
      addedBy: user1._id,
      title: 'Lorem Ipsum title',
      text: 'Lorem Ipsum is simply dummg industry. Lorem Ipsum has been the industry',
      sourceUrl: 'https://www.lipsum.com/',
      sourceType: 'article',
      lang: 'en',
    };

    article2 = {
      _id: '41224d776a326fb40f000003',
      addedBy: user1._id,
      title: 'Lorem Ipsum title',
      text: 'Lorem Ipsum is simply dummg industry. Lorem Ipsum has been the industry',
      sourceUrl: 'https://www.lipsum.com/',
      sourceType: 'article',
      lang: 'en',
    };

    claim1 = {
      addedBy: user1._id,
      articleId: article1._id,
      _id: '41224d776a326fb40f000008',
      text: 'Prvy claim hh nejaky nahodny text. Nema to ziadny zmysel, ale vsak to nie je podsatatne..',
      nPositiveVotes: 0,
      nNegativeVotes: 0,
      nBeenVoted: 0,
    };

    claim2 = {
      addedBy: user1._id,
      articleId: article1._id,
      _id: '41224d776a326fb40f000009',
      text: 'Prvy claim hh nejaky nahodny text. Nema to ziadny zmysel, ale vsak to nie je podsatatne..',
      nPositiveVotes: 0,
      nNegativeVotes: 0,
      nBeenVoted: 0,
    };

    review1 = {
      _id: '21224d776a326fb40f000003',
      userId: user1._id,
      claimId: claim1._id,
      articleId: article1._id,
      vote: 'positive',
      links: ['factcheck.cz', 'redirect.com', 'https://www.youtube.c'],
      text: 'Prvy claim hh nejaky nahodny text. Nema to ziadny zmysel, ale vsak to nie je podsatatne..',
      nPositiveVotes: 0,
      nNegativeVotes: 0,
      nNeutralVotes: 0,
      nBeenVoted: 0,
    };

    review2 = {
      _id: '21224d776a326fb40f100003',
      userId: user1._id,
      claimId: claim1._id,
      articleId: article1._id,
      vote: 'negative',
      links: ['factddcheck.cz', 'rrredirect.com', 'https://www.youtube.c'],
      text: 'Prvy claim hh nejaky nahodny text. Nema to ziadny zmysel, ale vsak to nie je podsatatne..',
      nPositiveVotes: 0,
      nNegativeVotes: 0,
      nNeutralVotes: 0,
      nBeenVoted: 0,
    };

    await Review.deleteMany({});
    await Claim.deleteMany({});
    await Article.deleteMany({});
    await User.deleteMany({});

    await User.create(user1);
    userAccessToken = (await User.findAndGenerateToken(user1)).accessToken;
    await User.create(user2);
    user2AccessToken = (await User.findAndGenerateToken(user2)).accessToken;

    await Article.create(article1);
    await Article.create(article2);
    await Claim.create(claim1);
    await Claim.create(claim2);
    await Review.create(review1);
    await Review.create(review2);
  });

  describe('POST /v1/vote?claimId=', async () => {
    it('Only articleId/claimId/reviewId or userId can be used for voting', () => {
      return request(app)
        .post(`/v1/vote?otherId=${claim2._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(positiveVote)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('user1 should vote for an claim1', async () => {
      return request(app)
        .post(`/v1/vote?claimId=${claim1._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(positiveVote)
        .expect(httpStatus.CREATED)
        .then(async (res) => {
          expect(res.body.rating).to.be.equal(1);
        })
        .then(async () => {
          const claim = await getClaimById(article1._id, claim1._id, userAccessToken);
          expect(claim.nPositiveVotes).to.be.equal(claim1.nPositiveVotes + 1);
          expect(claim.nNegativeVotes).to.be.equal(claim1.nNegativeVotes);
          expect(claim.nBeenVoted).to.be.equal(claim1.nBeenVoted + 1);
          claim1.nPositiveVotes += 1;
          claim1.nBeenVoted += 1;
        });
    });

    it('user1 should vote for an claim2', async () => {
      return request(app)
        .post(`/v1/vote?claimId=${claim2._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(positiveVote)
        .expect(httpStatus.CREATED)
        .then(async (res) => {
          expect(res.body.rating).to.be.equal(1);
        })
        .then(async () => {
          const claim = await getClaimById(article1._id, claim2._id, userAccessToken);
          expect(claim.nPositiveVotes).to.be.equal(claim2.nPositiveVotes + 1);
          expect(claim.nNegativeVotes).to.be.equal(claim2.nNegativeVotes);
          expect(claim.nBeenVoted).to.be.equal(claim2.nBeenVoted + 1);
          claim2.nPositiveVotes += 1;
          claim2.nBeenVoted += 1;
        });
    });

    it('user2 should vote for an claim1', async () => {
      return request(app)
        .post(`/v1/vote?claimId=${claim1._id}`)
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .send(positiveVote)
        .expect(httpStatus.CREATED)
        .then(async (res) => {
          expect(res.body.rating).to.be.equal(1);
        })
        .then(async () => {
          const claim = await getClaimById(article1._id, claim1._id, user2AccessToken);
          expect(claim.nPositiveVotes).to.be.equal(claim1.nPositiveVotes + 1);
          expect(claim.nNegativeVotes).to.be.equal(claim1.nNegativeVotes);
          expect(claim.nBeenVoted).to.be.equal(claim1.nBeenVoted + 1);
          claim1.nPositiveVotes += 1;
          claim1.nBeenVoted += 1;
        });
    });

    it('user2 should give negative vote for claim2', async () => {
      return request(app)
        .post(`/v1/vote?claimId=${claim2._id}`)
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .send(negVote)
        .expect(httpStatus.CREATED)
        .then(async (res) => {
          expect(res.body.rating).to.be.equal(negVote.rating);
        })
        .then(async () => {
          const claim = await getClaimById(article1._id, claim2._id, user2AccessToken);
          expect(claim.nPositiveVotes).to.be.equal(claim2.nPositiveVotes);
          expect(claim.nNegativeVotes).to.be.equal(claim2.nNegativeVotes + 1);
          expect(claim.nBeenVoted).to.be.equal(claim2.nBeenVoted + 1);
          claim2.nNegativeVotes += 1;
          claim2.nBeenVoted += 1;
        });
    });

    it('should return conflict when user1 votes again for claim2', () => {
      return request(app)
        .post(`/v1/vote?claimId=${claim2._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(positiveVote)
        .expect(httpStatus.CONFLICT);
    });

    it('should return not_found when id does not exist', () => {
      return request(app)
        .post('/v1/vote?claimId=41224d776a326fb40f010000')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(positiveVote)
        .expect(httpStatus.NOT_FOUND);
    });

    it('should return error when rating is not specified', () => {
      return request(app)
        .post(`/v1/vote?claimId=${claim2._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({ text: 'hehe' })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          const { field, location, messages } = res.body.errors[0];

          expect(field).to.be.equal('rating');
          expect(location).to.be.equal('body');
          expect(messages).to.include('"rating" is required');
        });
    });

    it('should return error no neither article/claim/review or userId is specified', () => {
      return request(app)
        .post('/v1/vote?claimId=')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({ text: 'hehe' })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          const { field, location, messages } = res.body.errors[0];

          expect(field).to.be.equal('rating');
          expect(location).to.be.equal('body');
          expect(messages).to.include('"rating" is required');
        });
    });
  });

  describe('POST /v1/vote?reviewId=', async () => {
    it('user1 should give neutral vote for an review1', async () => {
      return request(app)
        .post(`/v1/vote?reviewId=${review1._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(neutralVote)
        .expect(httpStatus.CREATED)
        .then(async (res) => {
          expect(res.body.rating).to.be.equal(neutralVote.rating);
        })
        .then(async () => {
          const review = await reviewById(article1._id, claim1._id, review1._id, userAccessToken);
          expect(review.nPositiveVotes).to.be.equal(review1.nPositiveVotes);
          expect(review.nNeutralVotes).to.be.equal(review1.nNeutralVotes + 1);
          expect(review.nNegativeVotes).to.be.equal(review1.nNegativeVotes);
          expect(review.nBeenVoted).to.be.equal(review1.nBeenVoted + 1);

          expect(review).to.have.a.property('userVote');
          expect(review.userVote).to.be.equal(neutralVote.rating);

          review1.nNeutralVotes += 1; // update local review obj
          review1.nBeenVoted += 1;
        });
    });

    it('user1 should give negative vote for an review2', async () => {
      return request(app)
        .post(`/v1/vote?reviewId=${review2._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(negVote)
        .expect(httpStatus.CREATED)
        .then(async (res) => {
          expect(res.body.rating).to.be.equal(negVote.rating);
        })
        .then(async () => {
          const review = await reviewById(article1._id, claim1._id, review2._id, userAccessToken);
          expect(review.nPositiveVotes).to.be.equal(review2.nPositiveVotes);
          expect(review.nNeutralVotes).to.be.equal(review2.nNeutralVotes);
          expect(review.nNegativeVotes).to.be.equal(review2.nNegativeVotes + 1);
          expect(review.nBeenVoted).to.be.equal(review2.nBeenVoted + 1);

          expect(review).to.have.a.property('userVote');
          expect(review.userVote).to.be.equal(negVote.rating);

          review2.nNegativeVotes += 1;
          review2.nBeenVoted += 1;
        });
    });

    it('user2 should give neutral vote for an review1', async () => {
      return request(app)
        .post(`/v1/vote?reviewId=${review1._id}`)
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .send(neutralVote)
        .expect(httpStatus.CREATED)
        .then(async (res) => {
          expect(res.body.rating).to.be.equal(neutralVote.rating);
        })
        .then(async () => {
          const review = await reviewById(article1._id, claim1._id, review1._id, user2AccessToken);
          expect(review.nPositiveVotes).to.be.equal(review1.nPositiveVotes);
          expect(review.nNeutralVotes).to.be.equal(review1.nNeutralVotes + 1);
          expect(review.nNegativeVotes).to.be.equal(review1.nNegativeVotes);
          expect(review.nBeenVoted).to.be.equal(review1.nBeenVoted + 1);

          review1.nNeutralVotes += 1;
          review1.nBeenVoted += 1;
        });
    });

    it('user2 should give positive vote for review2', async () => {
      return request(app)
        .post(`/v1/vote?reviewId=${review2._id}`)
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .send(positiveVote)
        .expect(httpStatus.CREATED)
        .then(async (res) => {
          expect(res.body.rating).to.be.equal(positiveVote.rating);
        })
        .then(async () => {
          const review = await reviewById(article1._id, claim1._id, review2._id, user2AccessToken);
          expect(review.nPositiveVotes).to.be.equal(review2.nPositiveVotes + 1);
          expect(review.nNegativeVotes).to.be.equal(review2.nNegativeVotes);
          expect(review.nBeenVoted).to.be.equal(review2.nBeenVoted + 1);
          expect(review).to.have.a.property('userVote');
          expect(review.userVote).to.be.equal(positiveVote.rating);

          review2.nPositiveVotes += 1;
          review2.nBeenVoted += 1;
        });
    });

    it('should return not_found when id does not exist', () => {
      return request(app)
        .post('/v1/vote?reviewId=41224d776a326fb40f010090')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(neutralVote)
        .expect(httpStatus.NOT_FOUND);
    });

    it('should return error when rating is not specified', () => {
      return request(app)
        .post(`/v1/vote?reviewId=${review2._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({ text: 'hehe' })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          const { field, location, messages } = res.body.errors[0];

          expect(field).to.be.equal('rating');
          expect(location).to.be.equal('body');
          expect(messages).to.include('"rating" is required');
        });
    });
  });

  describe('POST /v1/vote?articleId=', async () => {
    it('user1 should vote for an article1', async () => {
      return request(app)
        .post(`/v1/vote?articleId=${article1._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(positiveVote)
        .expect(httpStatus.CREATED)
        .then((res) => {
          expect(res.body.rating).to.be.equal(positiveVote.rating);
        });
    });

    it('user1 should vote for the article2', () => {
      return request(app)
        .post(`/v1/vote?articleId=${article2._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(positiveVote)
        .expect(httpStatus.CREATED)
        .then((res) => {
          expect(res.body.rating).to.be.equal(positiveVote.rating);
        });
    });

    it('user2 should vote for the article1', () => {
      return request(app)
        .post(`/v1/vote?articleId=${article1._id}`)
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .send(positiveVote)
        .expect(httpStatus.CREATED)
        .then((res) => {
          expect(res.body.rating).to.be.equal(positiveVote.rating);
        });
    });

    it('should return conflict when user1 votes again for article2', () => {
      return request(app)
        .post(`/v1/vote?articleId=${article2._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(positiveVote)
        .expect(httpStatus.CONFLICT);
    });

    it('should return not found when id does not exist', () => {
      return request(app)
        .post('/v1/vote?articleId=41224d776a326fb40f010000') // specified claimId but looking for articleId
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(positiveVote)
        .expect(httpStatus.NOT_FOUND);
    });

    it('should return error when rating is not specified', () => {
      return request(app)
        .post(`/v1/vote?articleId=${article2._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({ text: 'hehe' })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          const { field, location, messages } = res.body.errors[0];

          expect(field).to.be.equal('rating');
          expect(location).to.be.equal('body');
          expect(messages).to.include('"rating" is required');
        });
    });
  });

  describe('POST /v1/vote?userId=', async () => {
    it('user1 should vote for user2', async () => {
      return request(app)
        .post(`/v1/vote?userId=${user2._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(positiveVote)
        .expect(httpStatus.CREATED)
        .then((res) => {
          expect(res.body.rating).to.be.equal(1);
        });
    });
  });
});
