var fs = require('fs'),
	cp = require('child_process'),
	path = require('path'),
	os = require('os');

var ospd;

// I support Win32 and linux64, if you want more you can change this but you'll have to add your own binaries.
switch(os.platform())
{
	case 'linux':
	{
		if(os.arch() === 'x64')
			ospd = "linux64";
		break;
	}
	case 'win32':
		ospd = "win32";
		break;
}

module.exports = {
	readMinidump: function(minidumpFile, symbolPath, callback) {
		cp.execFile("stackwalker",
			[
				path.resolve(minidumpFile),
				path.resolve(symbolPath)
			],
			{
				cwd: path.resolve(__dirname, "platform_binaries", ospd)
			}, callback
		);
	},
	Minidump : _Minidump,
	OSInfo: _OSInfo,
	CPUInfo: _CPUInfo,
	Crash: _Crash,
	Module: _Module,
	Frame: _Frame
};