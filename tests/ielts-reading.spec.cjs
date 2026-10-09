const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const http = require('http');
let server;
test.beforeAll(async () => {
  server = http.createServer((req,res)=>{
    const target = path.resolve(process.cwd(), '.' + decodeURIComponent(req.url.split('?')[0]));
    if(!target.startsWith(process.cwd()+path.sep)){res.writeHead(403);return res.end()}
    fs.readFile(target,(err,bytes)=>{if(err){res.writeHead(404);return res.end()}
      res.setHeader('Content-Type',target.endsWith('.html')?'text/html':target.endsWith('.js')?'application/javascript':target.endsWith('.json')?'application/json':'text/css');res.end(bytes)});
  });
  await new Promise(resolve=>server.listen(8765,'127.0.0.1',resolve));
});
test.afterAll(async()=>{await new Promise(resolve=>server.close(resolve))});
test('reading starts, navigates across 40 questions, saves answers, and submits', async ({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:8765/ielts-practice.html');
  await page.getByRole('button',{name:'Start or resume test'}).click();
  await expect(page.locator('#load-error')).toHaveText('');
  await expect(page.locator('#question-1')).toBeVisible();
  await expect(page.locator('#navigation button')).toHaveCount(40);
  await page.locator('#question-1 input[value="TRUE"]').check();
  await expect(page.locator('#progress')).toHaveText('1 of 40 answered');
  await page.locator('#nav-40').click();
  await expect(page.locator('#question-40')).toBeVisible();
  await page.locator('#notes-toggle').click();
  await page.locator('#notes').fill('My note');
  await page.reload();
  await page.getByRole('button',{name:'Start or resume test'}).click();
  await expect(page.locator('#question-40')).toBeVisible();
  await page.locator('#notes-toggle').click();
  await expect(page.locator('#notes')).toHaveValue('My note');
  await expect(page.locator('#progress')).toHaveText('1 of 40 answered');
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('#submit').click();
  await expect(page.locator('#results')).toContainText('Correct: 1 of 40');
  await expect(page.locator('#results')).toContainText('Passage 1: 1/13');
  expect(errors).toEqual([]);
});
test('practice timer and multi select maximum',async({page})=>{
  await page.goto('http://127.0.0.1:8765/ielts-practice.html');
  await page.locator('#mode').selectOption('practice');
  await page.getByRole('button',{name:'Start or resume test'}).click();
  await expect(page.locator('#load-error')).toHaveText('');
  await expect(page.locator('#clock')).toContainText('Elapsed');
  await page.locator('#nav-12').click();
  const checks=page.locator('#question-12 input[type=checkbox]');
  await checks.nth(0).check();await checks.nth(1).check();await checks.nth(2).click();
  await expect(page.locator('#question-12 input[type=checkbox]:checked')).toHaveCount(2);
});

test('results allow another attempt and show question review',async({page})=>{
  await page.goto('http://127.0.0.1:8765/ielts-practice.html');
  await page.locator('#start').click();
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('#submit').click();
  await expect(page.locator('#results')).toContainText('Question 40:');
  await page.getByRole('button',{name:'Return to test selection'}).click();
  await expect(page.locator('#setup')).toBeVisible();
  await page.locator('#start').click();
  await expect(page.locator('#progress')).toHaveText('0 of 40 answered');
});
test('mobile layout shows both panes and passage tabs',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('http://127.0.0.1:8765/ielts-practice.html');
  await page.locator('#start').click();
  await expect(page.locator('#passage')).toBeVisible();
  await expect(page.locator('#questions')).toBeVisible();
  await expect(page.locator('#passage-tabs button')).toHaveCount(3);
  await page.locator('#passage-tabs button').nth(1).click();
  await expect(page.locator('#question-14')).toBeVisible();
});

test('selection toolbar highlights passage text and notes collapse',async({page})=>{
  await page.goto('http://127.0.0.1:8765/ielts-practice.html');
  await page.locator('#start').click();
  await expect(page.locator('#passage-content p').first()).toBeVisible();
  await page.locator('#passage-content p').first().evaluate(el=>{const range=document.createRange();range.setStart(el.firstChild,0);range.setEnd(el.firstChild,16);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range)});
  await expect(page.locator('#selection-toolbar')).toBeVisible();
  await page.locator('#selection-highlight').click();
  await expect(page.locator('#passage-content mark').first()).toBeVisible();
  await page.locator('#notes-toggle').click();
  await expect(page.locator('#notes-panel')).toBeVisible();
  await page.locator('#notes-toggle').click();
  await expect(page.locator('#notes-panel')).toBeHidden();
});

test('split divider resizes and selection offers four actions',async({page})=>{
  await page.goto('http://127.0.0.1:8765/ielts-practice.html');
  await page.locator('#start').click();
  const divider=page.locator('#pane-divider');
  await expect(divider).toBeVisible();
  await divider.focus();
  await page.keyboard.press('ArrowRight');
  await expect(divider).toHaveAttribute('aria-valuenow','55');
  await page.locator('#passage-content p').first().evaluate(el=>{const range=document.createRange();range.setStart(el.firstChild,0);range.setEnd(el.firstChild,12);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range)});
  await expect(page.locator('#selection-toolbar button')).toHaveCount(4);
  await page.locator('#selection-highlight').click();
  await expect(page.locator('#passage-content mark')).toHaveCount(1);
  await page.locator('#passage-content mark').first().evaluate(el=>{const range=document.createRange();range.selectNodeContents(el);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range)});
  await page.locator('#selection-unhighlight').click();
  await expect(page.locator('#passage-content mark')).toHaveCount(0);
});
