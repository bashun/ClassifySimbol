/*第１引数で指定されたテキストファイルを読み込み
* 本スクリプトと同階層にans.txtを出力する。
* ただし、色分けできない場合（一つだけ孤立した数が存在する場合は）解答不可をans.txtに出力する
*/
// グローバル変数宣言
var fs = require('fs'),
    inputFileName = __dirname + '/' + process.argv[2],
    outputFileName = __dirname + "/ans.txt",
    inputLineArray = fs.readFileSync(inputFileName).toString().replace(/\n$/, '').split('\n'),
    inputArray = [], i, j,
    simbolArray = ['+', '-', '*', '/'], simbolMap = {},
    MAX_ROW, MAX_COL, grpNo = 0, ans = '', simbolCnt = 0, checkSimbolCnt = 0;

// 初期化処理
function initialize() {
    MAX_ROW = inputLineArray.length;
    MAX_COL = inputLineArray[0].length;

    for (i = 0; i < MAX_ROW; i++) {

        inputArray[i] = [];
        for (j = 0; j < MAX_COL; j++) {
            inputArray[i][j] = {
                val: inputLineArray[i].substr(j, 1),
                check: false
            };
            var val = inputArray[i][j].val;
            simbolMap[val] = {
                simbol: '',
                grpNo: val,
                matched: []
            };
        }
    }
}

//  指定された要素の上下左右の要素に同じ値の要素がないか確認する
function checkAround(row, col) {

    for (var row_add = -1; row_add < 2; row_add++) {
        // 範囲外は対象外
        if (row + row_add < 0 || row + row_add > MAX_ROW - 1) continue;
        for (var col_add = -1; col_add < 2; col_add++) {
            // 範囲外は対象外
            if (col + col_add < 0 || col + col_add > MAX_COL - 1) continue;
            // 斜めに位置する要素は対象外
            if (Math.abs(row_add) === Math.abs(col_add)) continue;

            var tagEle = inputArray[row][col];
            var addEle = inputArray[row + row_add][col + col_add];

            // 未チェックの要素を検証
            if (addEle.check === false) {
                if (addEle.val === tagEle.val) {
                    addEle.check = true;
                    checkAround(row + row_add, col + col_add);
                }
            } else {
                // 値が同じ場合は対象外
                if (addEle.val !== tagEle.val) {
                    // チェック済みの要素の場合はグループ番号を追加する
                    var matchedTagArray = simbolMap[tagEle.val].matched,
                        matchedAddArray = simbolMap[addEle.val].matched,
                        addVal = addEle.val, tagVal = tagEle.val;
                    if (matchedTagArray.indexOf(addVal) === -1) simbolMap[tagEle.val].matched.push(addEle.val);
                    if (matchedAddArray.indexOf(tagVal) === -1) simbolMap[addEle.val].matched.push(tagEle.val);
                }
            }
        }
    }

}

// 接しているブロックが多いブロックから記号を確定する
function entrySimbol() {
    var tempArray = [], key, i;
    for (key in simbolMap) {
        tempArray.push(simbolMap[key]);
    }
    tempArray.sort(function (a, b) {
        return b.matched.length - a.matched.length;
    });

    for (i = 0; i < tempArray.length; i++) {
        simbolCnt = 0;
        simbolMap[tempArray[i].grpNo].simbol = getSimbol();
        checkSimbol(simbolMap[tempArray[i].grpNo], tempArray[i].matched);
    }
}

// シンボルを返す
function getSimbol() {
    return simbolArray[simbolCnt++ % simbolArray.length];
}

/* tagEle.simbolが接している他のブロックと重複がないか確認する
*   tagEle - 確認対象要素
*   tagArray - 接しているブロック番号を格納した配列
*/
function checkSimbol(tagEle, tagArray) {
    try {
        // 全ての記号が確定不可能の場合の例外処理
        if (checkSimbolCnt > simbolArray.length) throw 'noSimbolException';
        
        // 接している全てのブロックにおいて確定している記号と比較する
        for (var i = 0; i < tagArray.length; i++) {
            
            // 一致する記号がある場合は、別の記号に置き換えて確認する
            if (simbolMap[tagArray[i]].simbol === tagEle.simbol) {
                tagEle.simbol = getSimbol();
                checkSimbolCnt++;
                checkSimbol(tagEle, tagArray);
            }
        }
        checkSimbolCnt = 0;

    } catch (e) {
        noSimbol();
        return;
    }

}

// 解析不可エラー
function noSimbol() {
    fs.writeFileSync(outputFileName, '解析不可');
    process.exit();
}

// main
initialize();

// check
for (i = 0; i < MAX_ROW; i++) {
    for (j = 0; j < MAX_COL; j++) {
        if (inputArray[i][j].check === false) {
            inputArray[i][j].check = true;
            checkAround(i, j);
        }
    }
}

// output
entrySimbol();
for (i = 0; i < MAX_ROW; i++) {
    for (j = 0; j < MAX_COL; j++) {
        ans = ans + simbolMap[inputArray[i][j].val].simbol;
    }
    ans = ans + '\n';
}

fs.writeFileSync(outputFileName, ans.replace(/\n$/, ''));

