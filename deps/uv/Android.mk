# Copyright (C) 2009 The Android Open Source Project
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE := uv

LOCAL_C_INCLUDES += \
	$(LOCAL_PATH)/include \
	$(LOCAL_PATH)/include/uv-private \
	$(LOCAL_PATH)/src \
 
LOCAL_SRC_FILES := \
	src/uv-common.c \
	src/version.c \
	src/fs-poll.c \
	src/inet.c \
	src/unix/async.c \
	src/unix/core.c \
	src/unix/dl.c \
	src/unix/error.c \
	src/unix/fs.c \
	src/unix/getaddrinfo.c \
	src/unix/linux-core.c \
	src/unix/linux-inotify.c \
	src/unix/linux-syscalls.c \
	src/unix/loop-watcher.c \
	src/unix/loop.c \
	src/unix/pipe.c \
	src/unix/poll.c \
	src/unix/process.c \
	src/unix/proctitle.c \
	src/unix/signal.c \
	src/unix/stream.c \
	src/unix/tcp.c \
	src/unix/thread.c \
	src/unix/threadpool.c \
	src/unix/timer.c \
	src/unix/tty.c \
	src/unix/udp.c

# debug
ifeq ($(debug),true)
LOCAL_CFLAGS += \
	-pthread \
	-g \
	--std=gnu89 \
	-pedantic \
	-Wall \
	-Wextra \
	-Wno-unused-parameter \
	-Wstrict-aliasing
endif

# uv
LOCAL_CFLAGS += \
	'-D_LARGEFILE_SOURCE' \
	'-D_FILE_OFFSET_BITS=64' \
	'-D_GNU_SOURCE' \
	'-DHAVE_CONFIG_H'

LOCAL_EXPORT_C_INCLUDES := \
	$(LOCAL_PATH)/include

include $(BUILD_STATIC_LIBRARY)
