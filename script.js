var puzzle = [
'QWERTYUIOP',
'ASDFGHJKL',
'ZXCVBNM'
];
var rows = 3, cols = 10, $winMsg = $('<p><h2>YOU WIN!</h2></p>');

function initBoard() {

	//set up the crossword
	$div = $('#container');
	for(var i = 0; i < rows; i++) {
		for(var j = 0; j < cols; j++) {
			var $block = $('<div class="block" data="false" select="false" wordselect="false"><div class="outer"><div class="inner"></div></div></div>');
			if(j == 0) $block.css('clear','both');
			$div.append($block);
		}
	}
	for(var row = 0; row < puzzle.length; row++) {
		for(var col = 0; col < puzzle[row].length; col++) {
			addLetter(puzzle[row].charAt(col), row+1, col+1, 0);
		}
	}
	selectBlock($div.children(':nth-child(1)'));
	selectWord($div.children(':nth-child(1)'), 'across', false);
/*	$('.block[data="true"]').each(function(i) {
		if(i < 14) $(this).find('.inner').html($(this).data('letter'));
	});
//*/	
	var arrowKeys = new Array(37,38,39,40);

	$('body').keydown(function(event) {
		var $selected = $('.block[select="true"]'), $next;
		if($selected.length !== 1) return false;
		
		//first check if the user typed a letter
		if((event.which > 64 && event.which < 91)) {
			var letter = String.fromCharCode(event.which).toUpperCase();
			$selected.find('.inner').html(letter);
			if(letter === $selected.data('letter')) $selected.css('color','black');
			else $selected.css('color','red');
			//advance to the next letter in the selected word
			var dirs = ['across', 'down'];
			for(var i = 0; i < dirs.length; i++) {
				$next = nextBlock($selected, dirs[i]);
				if(isLetter($next) && $next.attr('wordselect') === 'true') {
					selectBlock($next);
					break;
				}
			}
			checkPuzzle();
			return true;
		}
		
		//then check if they are toggling the direction
		if(event.which === 32) {
			toggleWordDirection($selected, true);
			return true;
		}
		
		//then check if they are trying to move to another block
		if($.inArray(event.which, arrowKeys) < 0) return false;
		event.preventDefault();
		console.log('key pressed: ' + event.which);
		var dir = '';
		switch(event.which) {
			case 37:
				$next = prevBlock($selected, dir='across');
				break;
			case 39:
				$next = nextBlock($selected, dir='across');
				break;
			case 40:
				$next = nextBlock($selected, dir='down');
				break;
			case 38:
				$next = prevBlock($selected, dir='down');
				break;
		}
		if(isLetter($next)) {
			selectBlock($next);
			selectWord($next, dir, false);
		}
		return true;
	});
}

function addLetter(letter, row, col, msgPos) {
	var $block = $('#container .block:nth-child(' + ((row-1)*cols+col) + ')');
	$block.data('letter',letter);
	$block.data('msgPos',msgPos);
	$block.attr('data','true');
	$block.click(function(e) {
		if($(this).is($('.block[select="true"]'))) {
			toggleWordDirection($(this), false);
			return;
		}
		selectBlock($(this));
		if(!selectWord($(this), 'across', false)) selectWord($(this), 'down', false);
	});
}

function selectBlock($block) {
	$('.block[select="true"]').attr('select','false');
	$block.attr('select', 'true');
}

function nextBlock($block, dir) {
	switch(dir) {
		case 'across':
			if($block.index() % cols === cols-1) return undefined;
			return $block.next();
		case 'down':
			return $block.nextAll().eq(cols-1);
	}
}

function prevBlock($block, dir) {
	switch(dir) {
		case 'across':
			if($block.index() % cols === 0) return undefined;
			return $block.prev();
		case 'down':
			return $block.prevAll().eq(cols-1);
	}
}

function isLetter($block) {
	return typeof $block !== 'undefined' && typeof $block.data('letter') === 'string';
}

function selectWord($block, dir, selectFirst) {
	var $curBlock = $block, $prevBlock, $word, $first;
	//seek to the beginning of the word
	while(isLetter($prevBlock = prevBlock($curBlock, dir))) $curBlock = $prevBlock;
	//mark all letters as wordselect
	$first = $word = $curBlock;
	while(isLetter($curBlock = nextBlock($curBlock, dir))) $word = $word.add($curBlock);
	if($word.length > 1) {
		$('.block[wordselect="true"]').attr('wordselect','false');
		$word.attr('wordselect', 'true');
		if(selectFirst) selectBlock($first);
		return true;
	}
	return false;
}

function isWordSelected($block, dir) {
	var $prev = prevBlock($block, dir), $next = nextBlock($block, dir);
	return (isLetter($prev) && $prev.attr('wordselect') === 'true') || (isLetter($next) && $next.attr('wordselect') === 'true');
}

function toggleWordDirection($selected, selectFirst) {
	if(isWordSelected($selected, 'down'))
		selectWord($selected, 'across', selectFirst);
	else if(isWordSelected($selected, 'across'))
		selectWord($selected, 'down', selectFirst);
}

function checkPuzzle() {
	var done = true, $letters = $('.block[data="true"]');
	$letters.each(function(i) {
		if($(this).find('.inner').html() !== $(this).data('letter')) done = false;
	});
	if(!done) return;
	$winMsg.appendTo('#hints');
}

$(document).ready(function() {
	initBoard();
});
