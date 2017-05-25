
@echo "Copying files..."

@copy node_modules\phantomjs-prebuilt\lib\phantom\bin\phantomjs.exe build\phantomjs.exe
@copy app\urlResponsive2png.js build\urlResponsive2png.js
@copy urls.txt build\urls.txt

@echo "Packaging app..."

@pkg . --out-dir .\build --debug >compile.log

echo "compile.log created"
