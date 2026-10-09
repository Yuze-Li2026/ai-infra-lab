"""Small stdio-preserving Windows supervisor for the Node command runner."""
import json
import os
import sys
from processes import owned_process


def main():
    if os.name != 'nt' or len(sys.argv) < 2:
        raise ValueError('This helper requires Windows and an executable argument')
    # Explicit handles are required for libuv's Windows pipes; implicit standard
    # handles can be non-inheritable even though Python can write to them.
    with owned_process(sys.argv[1:], stdin=sys.stdin, stdout=sys.stdout, stderr=sys.stderr) as child:
        return child.wait()


if __name__ == '__main__':
    try:
        code = main()
    except KeyboardInterrupt:
        code = 130
    except (OSError, ValueError, RuntimeError) as error:
        # Captured by process.mjs; inherited-stderr callers receive the same diagnostic.
        print('AI_INFRA_PROCESS_START_ERROR:' + json.dumps(str(error), ensure_ascii=True), file=sys.stderr)
        code = 126
    sys.exit(code)
