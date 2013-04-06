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
# This file builds a static library suitable for inclusion in a 
# shared library (eg for JNI).

LOCAL_PATH := $(call my-dir)
include $(LOCAL_PATH)/Android.common.mk

# to override exit handling in node.cc
LOCAL_CFLAGS += -DNODE_LIBRARY

include $(BUILD_STATIC_LIBRARY)

$(call import-module,deps/cares)
$(call import-module,deps/http_parser)
$(call import-module,deps/uv)
$(call import-module,deps/v8)
$(call import-module,pty)
$(call import-module,openssl-android)
