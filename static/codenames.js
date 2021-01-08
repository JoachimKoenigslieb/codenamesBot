myStorage = window.sessionStorage

function getGameState() {
	game = {}

	board = document.getElementsByClassName("board")[0];
	for (i = 0; i<5; i++){
		row = board.getElementsByClassName("row"+i)[0]
		for (j = 0; j<5; j++){
			button = row.getElementsByClassName("col"+j)[0]
			game[i.toString() + j.toString()] = button.getAttribute("clicked")
		}
	}

	return game
}

function setListeners() {
	board = document.getElementsByClassName("board")[0];
	for (i = 0; i<5; i++){
		row = board.getElementsByClassName("row"+i)[0]
		for (j = 0; j<5; j++){
			button = row.getElementsByClassName("col"+j)[0]
			button.setAttribute('clicked', false)
			button.addEventListener('click', e => {
				clickedButton = e.toElement

				clickState = clickedButton.getAttribute('clicked')
				if (clickState === "true"){
					clickedButton.setAttribute("clicked", false)
				}
				if (clickState === "false"){
					clickedButton.setAttribute("clicked", true)
				}
			})
		}
	}
}

function setGameState(game) {
	board = document.getElementsByClassName("board")[0];
	for (i = 0; i<5; i++){
		row = board.getElementsByClassName("row"+i)[0]
		for (j = 0; j<5; j++){
			button = row.getElementsByClassName("col"+j)[0]
			
			buttonState = game[i.toString() + j.toString()]
			button.innerText = buttonState.word

			button.setAttribute("owner", buttonState.owner)
		}
	}

}

function setHint(hint){
	hintDiv = document.getElementById('hintMessage')
	hintDiv.innerText = hint
}

function createInitialState(wordList, red, blue, killWord, hint) {
	const game = {}

	for (i = 0; i<5; i++){
		for (j = 0; j<5; j++){
			buttonId = i.toString() + j.toString()
			game[buttonId] = {word: wordList[i][j], owner: "hidden"}
		}
	}

	game.red = red
	game.blue = blue
	game.killWord = killWord
	
	setHint(hint)
	myStorage.setItem('game', JSON.stringify(game))

	return game
}

function sendTurn(){
	clickedElements = []
	clickedStates = []
	board = document.getElementsByClassName("board")[0];
	
	game = JSON.parse(sessionStorage.getItem('game'))

	for (i = 0; i<5; i++){
		row = board.getElementsByClassName("row"+i)[0]
		for (j = 0; j<5; j++){
			button = row.getElementsByClassName("col"+j)[0]
			clickState = button.getAttribute('clicked') === 'true' ? true : false
			ownerState = button.getAttribute('owner')
			if (clickState){
				buttonState = [i, j, clickState, ownerState]
				clickedStates.push(buttonState)
				clickedElements.push(button)
			}
		}
	}

	fetch('./make-move', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({clicked: clickedStates, game: game})})
		.then(resp => resp.json())
			.then(resp => {
				console.log(resp)
				// set state to response state.
				clickedElements.forEach(button => {button.setAttribute('clicked', 'false')})
				setGameState(resp)
				myStorage.setItem('game', JSON.stringify(resp))
				setHint(resp.hint)
			})
			.catch(error => {
				console.log('sumthing wrong brah', error)
		})
}

function getNewGame() {
	fetch('./new-game')
		.then(response => response.json())
		.then(response => {
			state = createInitialState(response.game, response.red, response.blue, response.killWord, response.hint)
			setListeners()
			setGameState(state)
	})
}