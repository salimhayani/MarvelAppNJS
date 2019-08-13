const https = require('https');
const md5 = require('md5');
const querystring = require('querystring');

const BASE_URL = 'https://gateway.marvel.com:443/';
const PUBLIC_KEY = '4f4eec12283e8b1b442220dce9e38ac2';
const PRIVATE_KEY = 'cf303a1a252223ba32b9ca92d7cfc9e643d94a0d';
const FIRST_OFFSET = 100;
const CHARACTERS_PER_PAGE = 4;
const NUMBER_OF_CHARACTERS_TO_GET = 20;


class marvelController{

    
    getCharacterList(req, res, next) {
        let user = req.session.user;
        let error = null;
    
        if(user) {
                
            let page = typeof req.params.page == 'undefined' || !Number.isInteger(parseInt(req.params.page)) ? 1 : req.params.page;
            let ts = Date.now();
            let hash = md5(ts + PRIVATE_KEY + PUBLIC_KEY);
            let limit = CHARACTERS_PER_PAGE;
            let offset = page == 1 ? FIRST_OFFSET : FIRST_OFFSET + (page-1) * CHARACTERS_PER_PAGE;
            // Pour ne pas dépasser 20 prsonnages en total pendant la pagination
            if(offset + CHARACTERS_PER_PAGE > FIRST_OFFSET + NUMBER_OF_CHARACTERS_TO_GET){
                let difference = (offset + CHARACTERS_PER_PAGE) - (FIRST_OFFSET + NUMBER_OF_CHARACTERS_TO_GET) ;
                limit = CHARACTERS_PER_PAGE - difference;
            }
            let maxpages = Math.ceil(NUMBER_OF_CHARACTERS_TO_GET / CHARACTERS_PER_PAGE);
    
            let query_params = {'apikey' : PUBLIC_KEY, 'ts' : ts, 'hash': hash, 'offset': offset, 'limit': limit};
            let query = querystring.encode(query_params);
            let heroes = {};
            let error = null;
    
            https.get(BASE_URL+'v1/public/characters?'+query, (resp) => {
                let body = '';
                resp.on('data', (data) => {
                    body += data;
                });
                
                resp.on('end', () => {
                    if(typeof JSON.parse(body).data == 'undefined'){
                        res.render('home', {opp:req.session.opp, page:null, maxPages:null, heroes:null, error:'Erreur de données'});
                        return;
                    }
                    heroes = JSON.parse(body).data.results;
                    res.render('home', {opp:req.session.opp, page:page, maxPages:maxpages, heroes:heroes, error:error});
                });
            
            }).on("error", (err) => {
                error = err.message;
                res.render('home', {opp:req.session.opp, heroes:heroes, error:error});
            });
                
            return;
        }
        res.redirect('/');
    }

    getCharacterInfo(req, res, next){
        let user = req.session.user;
        let error = null;

        if(user) {
                
            if(typeof req.params.id == 'undefined'){
                res.redirect('/list');
            }
            let id = req.params.id;
            let ts = Date.now();
            let hash = md5(ts + PRIVATE_KEY + PUBLIC_KEY);

            let query_params = {'apikey' : PUBLIC_KEY, 'ts' : ts, 'hash': hash};
            let query = querystring.encode(query_params);
            let hero = {};
            let error = null;

            https.get(BASE_URL+'v1/public/characters/'+ id +'?'+query, (resp) => {
                let body = '';
                resp.on('data', (data) => {
                    body += data;
                });
                
                resp.on('end', () => {
                    if(typeof JSON.parse(body).data == 'undefined'){
                        res.render('character', {opp:req.session.opp, hero:null, error:'Erreur de données'});
                        return;
                    }
                    hero = JSON.parse(body).data.results[0];
                    res.render('character', {opp:req.session.opp, hero:hero, error:null});
                });
            
            }).on("error", (err) => {
                error = err.message;
                res.render('character', {opp:req.session.opp, hero:null, error:error});
            }).end();
                
            return;
        }
        res.redirect('/');
    }

}

module.exports = marvelController;