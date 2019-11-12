require 'json'

EMCC_FLAGS = "-O3 --memory-init-file 0 --llvm-opts \"['-tti', '-domtree', '-tti', '-domtree', '-deadargelim', '-domtree', '-instcombine', '-domtree', '-jump-threading', '-domtree', '-instcombine', '-reassociate', '-domtree', '-loops', '-loop-rotate', '-licm', '-domtree', '-instcombine', '-loops', '-loop-idiom', '-loop-unroll', '-memdep', '-memdep', '-memcpyopt', '-domtree', '-demanded-bits', '-instcombine', '-jump-threading', '-domtree', '-memdep', '-loops', '-licm', '-adce', '-domtree', '-instcombine', '-elim-avail-extern', '-float2int', '-domtree', '-loops', '-loop-rotate', '-demanded-bits', '-instcombine', '-domtree', '-instcombine', '-loops', '-loop-unroll', '-instcombine', '-licm', '-strip-dead-prototypes', '-domtree']\" --llvm-lto 3 -s ENVIRONMENT='worker' -s USE_CLOSURE_COMPILER=1 -s AGGRESSIVE_VARIABLE_ELIMINATION=1 -s NO_EXIT_RUNTIME=1 -s NO_FILESYSTEM=1 -s INVOKE_RUN=0 -s DOUBLE_MODE=0 -s ALLOW_MEMORY_GROWTH=1 -s WASM=1 -s MODULARIZE=1"

c_files = FileList["./native/*.c"]

exported_functions = [
	"_malloc",
	"_free",
	"_h264bsdAlloc",
	"_h264bsdFree",
	"_h264bsdInit",
	"_h264bsdDecode",
	"_h264bsdShutdown"
]

exported_runtime_methods = [
	'getValue'
]

EXPORT_FLAGS = "-s EXTRA_EXPORTED_RUNTIME_METHODS='#{JSON.generate(exported_runtime_methods)}' -s EXPORTED_FUNCTIONS='#{JSON.generate(exported_functions)}'"

file "TinyH264.js" => c_files do
	sh "emcc #{c_files.join(' ')} #{EMCC_FLAGS} #{EXPORT_FLAGS} -o ./src/TinyH264.js"
end

task :clean do
	FileUtils.rm_f("./src/TinyH264.js")
end

desc "Check for prereq tools"
task :setup do
	sh("emcc --version") { |ok, res| fail("Can't find emscripten binaries.") unless ok }
	puts("Ready to go")
end

task :default => [:setup, 'TinyH264.js']
