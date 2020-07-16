const express = require('express');
const bodyParser= require('body-parser');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://Seung:ch8925@cluster0.bpear.mongodb.net/test?retryWrites=true&w=majority';

var port = process.env.PORT || 4000;

// server와 browser가 연결될때까지 기다리는 것
app.listen(port, function() {
	console.log('listening on 3000')
});

// crud handlers
MongoClient.connect(url, {
	useUnifiedTopology: true
} , (err, database) => {
	if(err) {
		console.error("MongoDB 연결 실패", err);
		return;
	}
	console.log("Connected to Database")
	const db = database.db('star-wars-quotes')
	const quotesCollection = db.collection('quotes')

	// app.use , app.get , app.post, app.listen 사용해서 db작업!
	app.set('view engine', 'ejs');
	// body-parser
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(express.static('public'));
	app.use(bodyParser.json());

	app.delete('/quotes', (req, res) => {
		//MongoDB에서 데이터 삭제하기
		//findOneAndUpdate와 형식 유사
		//main.js에서 fetch를 통해 이미 name을 전송함
		quotesCollection.deleteOne(
			{name: req.body.name }
			//options은 생략 가능, 이 경우에 설정할 부분이 없음
		)
			.then(result => {
				//javascript로 다시 결과를 보내줌!
				if(result.deletedCount === 0) {
					return res.json('No quote to Delete')
				}
				res.json("Deleted BabO's quote")
			})
			.catch(error => console.error(error))
	});

	app.put('/quotes', (req, res) => {
		// console.log(req.body)

	  quotesCollection.findOneAndUpdate(
	      {name: 'SSeung'},
	      {
	          $set: {
	              name: req.body.name,
	              quote: req.body.quote
	          }
	      },
	      {
	          // 우리가 찾는 쿼리가 없을 경우 setting값을 quotes에 추가한다
	          upsert: true
	      }
			)
      .then( result => {
      	// console.log(result)
				res.json('Success')
      })
      .catch( error => console.error(error))
	});

	app.post('/quotes', (req, res) => {
		quotesCollection.insertOne(req.body)
		.then(result => {
			res.redirect('/')
		})
		.catch(error => console.error(error))
	});

// sendFile method를 통해 index.html파일로 연결하자
	app.get('/', (req, res) => {
		// res.sendFile(__dirname + '/index.html')
		const cursor = db.collection('quotes').find().toArray()
    	.then(results => {
				res.render('index.ejs', { quotes: results })
      })
    	.catch(error => console.error(error))
	});



});
