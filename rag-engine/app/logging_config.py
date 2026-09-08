import logging
import os


LOG_FORMAT = "%(asctime)s %(levelname)s %(name)s %(message)s"


def setup_logging() -> str:
    level_name = os.getenv("LOG_LEVEL", "INFO").upper()
    root_logger = logging.getLogger()
    if not root_logger.handlers:
        logging.basicConfig(level=level_name, format=LOG_FORMAT)
    else:
        root_logger.setLevel(level_name)
        for handler in root_logger.handlers:
            handler.setFormatter(logging.Formatter(LOG_FORMAT))
    return level_name
