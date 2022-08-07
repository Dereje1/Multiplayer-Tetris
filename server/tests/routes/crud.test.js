const { saveSingleGameResults, saveMatchGameResults, fetchUserData } = require('../../routes/crud')
const Single = require('../../models/single');
const Match = require('../../models/match');
const User = require('../../models/user');

describe('Saving single game results', () => {
    let json;
    beforeEach(() => {
        json = jest.fn()
        Single.create = jest.fn().mockResolvedValue('single game result stored in db');
    })
    afterEach(() => {
        json.mockClear()
        Single.create.mockClear()
    })

    it('will not save results if ids do not match', async () => {
        const req = {
            body: { googleId: 'stub_google_id_2' },
            user: {
                google: {
                    id: 'stub_google_id_1'
                }
            }
        }
        const res = { json }
        await saveSingleGameResults(req, res)
        expect(json).toHaveBeenCalledWith({ "error": "Unable to match Ids, Data not saved!!" })
        expect(Single.create).not.toHaveBeenCalled()
    })

    it('will save results if ids match', async () => {
        const req = {
            body: { googleId: 'stub_google_id_1' },
            user: {
                google: {
                    id: 'stub_google_id_1'
                }
            }
        }
        const res = { json }
        await saveSingleGameResults(req, res)
        expect(json).toHaveBeenCalledWith("single game result stored in db")
        expect(Single.create).toHaveBeenCalled()
    })

    it('will catch and send errors', async () => {
        const req = {
            user: {
                google: {
                    id: 'stub_google_id_1'
                }
            }
        }
        const res = { status: jest.fn(() => ({ send: jest.fn() })) }
        await saveSingleGameResults(req, res)
        expect(res.status).toHaveBeenCalledWith(400)
    })
})

describe('Saving match results', () => {
    let json;
    beforeEach(() => {
        json = jest.fn()
        Match.create = jest.fn().mockResolvedValue('match result stored in db');
    })
    afterEach(() => {
        json.mockClear()
        Match.create.mockClear()
    })

    it('will not save results if ids do not match', async () => {
        const req = {
            body: { winnerGoogleId: 'stub_google_id_2', looserGoogleId: 'stub_google_id_3' },
            user: {
                google: {
                    id: 'stub_google_id_1'
                }
            }
        }
        const res = { json }
        await saveMatchGameResults(req, res)
        expect(json).toHaveBeenCalledWith({ "error": "Unable to match Ids, Data not saved!!" })
        expect(Match.create).not.toHaveBeenCalled()
    })

    it('will save results if ids match', async () => {
        const req = {
            body: { winnerGoogleId: 'stub_google_id_1', looserGoogleId: 'stub_google_id_3' },
            user: {
                google: {
                    id: 'stub_google_id_1'
                }
            }
        }
        const res = { json }
        await saveMatchGameResults(req, res)
        expect(json).toHaveBeenCalledWith("match result stored in db")
        expect(Match.create).toHaveBeenCalled()
    })

    it('will catch and send errors', async () => {
        const req = {
            user: {
                google: {
                    id: 'stub_google_id_1'
                }
            }
        }
        const res = { status: jest.fn(() => ({ send: jest.fn() })) }
        await saveMatchGameResults(req, res)
        expect(res.status).toHaveBeenCalledWith(400)
    })
})

describe('Fetching User data', () => {
    let json;
    beforeEach(() => {
        json = jest.fn()
        Single.find = jest.fn(() => ({
            sort: jest.fn(() => ({
                exec: jest.fn().mockResolvedValue('Single results for user')
            }))
        }))
        Match.find = jest.fn(() => ({
            or: jest.fn(() => ({
                sort: jest.fn(() => ({
                    exec: jest.fn().mockResolvedValue([{
                        winnerGoogleId: 'stub winner Id',
                        looserGoogleId: 'stub looser Id'
                    }])
                }))
            }))
        }));
        User.find = jest.fn(() => ({
            where: jest.fn(() => ({
                in: jest.fn(() => ({
                    exec: jest.fn().mockResolvedValue([
                        { google: { id: 'stub opponent Id', displayName: 'stub opponent displayname' } }
                    ])
                }))
            }))
        }))
    })
    afterEach(() => {
        json.mockClear()
        Single.find.mockClear()
        Match.find.mockClear()
        User.find.mockClear()
    })

    it('will fetch user data', async () => {
        const req = {
            user: {
                google: {
                    id: 'stub_google_id_1'
                }
            }
        }
        const res = { json }
        await fetchUserData(req, res)
        expect(json).toHaveBeenCalledWith({
            singleStats: 'Single results for user',
            matchStats: [
                {
                    winnerGoogleId: 'stub winner Id',
                    looserGoogleId: 'stub looser Id'
                }
            ],
            opponentNames: { 'stub opponent Id': 'stub opponent displayname' }
        })
        expect(Single.find).toHaveBeenCalledWith({"googleId": "stub_google_id_1"})
        expect(Match.find).toHaveBeenCalled()
        expect(User.find).toHaveBeenCalled()
    })

    it('will catch and send errors', async () => {
        const req = {
            user: {
                google: {
                    id: 'stub_google_id_1'
                }
            }
        }
        const res = { status: jest.fn(() => ({ send: jest.fn() })) }
        await fetchUserData(req, res)
        expect(res.status).toHaveBeenCalledWith(400)
    })
})